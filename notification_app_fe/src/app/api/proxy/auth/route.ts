import { NextResponse } from "next/server";

export async function POST() {
  try {
    const payload = {
      email: process.env.NEXT_PUBLIC_EMAIL,
      name: process.env.NEXT_PUBLIC_NAME,
      rollNo: process.env.NEXT_PUBLIC_ROLL_NO,
      accessCode: process.env.NEXT_PUBLIC_ACCESS_CODE,
      clientID: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
    };

    // Debug: check if env vars are loaded
    console.log("AUTH PAYLOAD:", JSON.stringify(payload));

    const res = await fetch("http://20.207.122.201/evaluation-service/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("AUTH RESPONSE STATUS:", res.status);
    console.log("AUTH RESPONSE BODY:", text);

    if (!res.ok) {
      return NextResponse.json({ error: `Auth failed: ${text}` }, { status: res.status });
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AUTH ERROR:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
