import type { MutableRefObject } from "react";
export type SceneConfig = {
  kind: "home" | "catalog" | "profile";
  id?: string; paused: boolean; diameter?: number | null; speed?: number | null;
  mode?: "object" | "size" | "distance"; progress?: MutableRefObject<number>;
};
export type SceneStatus = "loading" | "ready" | "failed";
export type SceneBinding = { host: HTMLElement; config: SceneConfig; status: (value: SceneStatus) => void };
export type SceneEngine = {
  attach(binding: SceneBinding): void; update(config: SceneConfig): void;
  detach(host: HTMLElement): void; depart(destination: string): void;
  cancelFlight(): void;
  rotate(direction: number): void; reset(): void; dispose(): void;
};
