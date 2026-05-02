import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = req.headers.get("authorization") || "";

    const query = new URLSearchParams();
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    const type = searchParams.get("notification_type");
    if (limit) query.set("limit", limit);
    if (page) query.set("page", page);
    if (type) query.set("notification_type", type);

    const url = `http://20.207.122.201/evaluation-service/notifications?${query.toString()}`;
    console.log("NOTIFICATIONS URL:", url);
    console.log("NOTIFICATIONS TOKEN:", token ? "present" : "MISSING");

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    const text = await res.text();
    console.log("NOTIFICATIONS STATUS:", res.status);
    console.log("NOTIFICATIONS BODY:", text.slice(0, 300));

    if (!res.ok) {
      return NextResponse.json({ error: `API error: ${text}` }, { status: res.status });
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("NOTIFICATIONS ERROR:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
