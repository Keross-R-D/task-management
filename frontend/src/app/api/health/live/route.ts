import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ live: "ok" }, { status: 200 });
}
