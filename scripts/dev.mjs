import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export function devOptions(args = []) {
  let port = "3100", hostname = "127.0.0.1";
  const rest = [];
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (["--port", "-p", "--hostname", "-H"].includes(argument)) {
      const value = args[++index];
      if (!value || value.startsWith("-")) throw new Error(`Missing value for ${argument}.`);
      if (argument === "--port" || argument === "-p") port = value;
      else hostname = value;
    } else if (argument.startsWith("--port=")) port = argument.slice(7);
    else if (argument.startsWith("--hostname=")) hostname = argument.slice(11);
    else rest.push(argument);
  }
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) throw new Error("Port must be an integer from 1 to 65535.");
  return { port, hostname, args: ["--hostname", hostname, "--port", port, ...rest] };
}

export function guardAddress(root) {
  const canonical = realpathSync(root);
  const identity = process.platform === "win32" ? canonical.toLowerCase() : canonical;
  const hash = createHash("sha256").update(identity).digest("hex").slice(0, 24);
  return process.platform === "win32" ? `\\\\.\\pipe\\orbital-dev-${hash}` : path.join(tmpdir(), `orbital-dev-${hash}.sock`);
}

const listen = (server, address) => new Promise((resolve, reject) => {
  const failed = (error) => { server.off("listening", ready); reject(error); };
  const ready = () => { server.off("error", failed); resolve(); };
  server.once("error", failed);
  server.once("listening", ready);
  server.listen(address);
});

export async function acquireDevGuard(root) {
  const address = guardAddress(root);
  const server = net.createServer((socket) => socket.destroy());
  try { await listen(server, address); }
  catch (error) {
    if (error.code !== "EADDRINUSE") throw error;
    // Windows named pipes disappear with their owner. Unix socket files can remain after a crash.
    if (process.platform !== "win32") {
      const active = await new Promise((resolve) => {
        const socket = net.connect(address);
        socket.once("connect", () => { socket.destroy(); resolve(true); });
        socket.once("error", (failure) => resolve(failure.code !== "ECONNREFUSED" && failure.code !== "ENOENT"));
      });
      if (!active) {
        try { if (lstatSync(address).isSocket()) unlinkSync(address); }
        catch (failure) { if (failure.code !== "ENOENT") throw failure; }
        try { await listen(server, address); }
        catch { throw new Error("Orbital already has a development process for this checkout. Stop it with Ctrl+C before starting another."); }
      } else throw new Error("Orbital already has a development process for this checkout. Stop it with Ctrl+C before starting another.");
    } else throw new Error("Orbital already has a development process for this checkout. Stop it with Ctrl+C before starting another.");
  }
  return () => new Promise((resolve) => server.close(resolve));
}

export async function runDev(root, args = process.argv.slice(2)) {
  const options = devOptions(args);
  const next = path.join(root, "node_modules", "next", "dist", "bin", "next");
  if (!existsSync(next)) throw new Error("Next.js is missing. Install this project's existing dependencies first.");
  const release = await acquireDevGuard(root);
  let child, requestedSignal, stopTimer, stoppingTree = false;
  const stopWindowsTree = () => {
    if (!child || child.exitCode !== null || child.signalCode !== null || stoppingTree) return;
    stoppingTree = true;
    // Only the exact child started by this runner, including its Next server child.
    const cleanup = spawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    cleanup.once("error", (error) => console.error(`[Orbital dev] Could not stop the owned Next process tree: ${error.message}`));
    cleanup.once("exit", (code) => { if (code && child.exitCode === null && child.signalCode === null) console.error(`[Orbital dev] Process-tree cleanup was denied (exit ${code}). Stop the runner's process tree using your process manager.`); });
  };
  const stop = (signal) => {
    requestedSignal = signal;
    if (!child || child.exitCode !== null || child.signalCode !== null) return;
    if (process.platform !== "win32") child.kill(signal);
    else if (signal === "SIGTERM") stopWindowsTree();
    // Ctrl+C first reaches Next's own console cleanup. A hidden/managed runner still has a bounded fallback.
    else if (!stopTimer) stopTimer = setTimeout(stopWindowsTree, 1200);
  };
  const interrupt = () => stop("SIGINT"), terminate = () => stop("SIGTERM");
  process.on("SIGINT", interrupt);
  process.on("SIGTERM", terminate);
  try {
    console.info(`[Orbital dev] http://${options.hostname}:${options.port} · isolated .next-dev cache · one process per checkout`);
    child = spawn(process.execPath, [next, "dev", ...options.args], { cwd: root, stdio: "inherit", windowsHide: true });
    const result = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => resolve({ code, signal }));
    });
    const diagnostic = { stoppedAt: new Date().toISOString(), exitCode: result.code, signal: result.signal ?? requestedSignal ?? null, port: Number(options.port) };
    const diagnosticDir = path.join(root, ".orbital-dev");
    mkdirSync(diagnosticDir, { recursive: true });
    writeFileSync(path.join(diagnosticDir, "last-exit.json"), `${JSON.stringify(diagnostic, null, 2)}\n`);
    console.info(`[Orbital dev] Stopped: exit ${result.code ?? "none"}, signal ${diagnostic.signal ?? "none"}. Details: .orbital-dev/last-exit.json`);
    return result.code ?? (requestedSignal ? 0 : 1);
  } finally {
    clearTimeout(stopTimer);
    process.off("SIGINT", interrupt);
    process.off("SIGTERM", terminate);
    await release();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runDev(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")).then((code) => { process.exitCode = code; }).catch((error) => {
    console.error(`[Orbital dev] ${error.message}`);
    process.exitCode = 1;
  });
}
