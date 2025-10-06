/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // TODO: handle your M-Pesa callback here (save to DB, verify payment, etc.)

    return NextResponse.json({ message: "Callback received successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Callback Error:", error.message);
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    console.error("Unknown error:", error);
    return NextResponse.json(
      { message: "Error processing callback" },
      { status: 500 }
    );
  }
}
