import { NextResponse } from "next/server";

export const revalidate = 60 * 60; // 1 hour

const WIKI_REST = "https://en.wikipedia.org/api/rest_v1";

function normalizeTitle(title: string) {
  return decodeURIComponent(title).trim().replace(/\s+/g, "_");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const titleRaw = searchParams.get("title") || "";
  const title = normalizeTitle(titleRaw);

  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }


  const url = `${WIKI_REST}/page/mobile-html/${encodeURIComponent(title)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "accept": "text/html; charset=utf-8",
      },
      next: { revalidate },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Wikipedia REST error ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();

    return NextResponse.json({
      title: title.replace(/_/g, " "),
      html,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch wikipedia page" },
      { status: 500 }
    );
  }
}
