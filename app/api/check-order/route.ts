import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const checkoutRequestId = searchParams.get("checkoutRequestId");

  if (!checkoutRequestId) {
    return NextResponse.json(
      { status: "failed", error: "Missing checkoutRequestId" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://gpower.africa/payment/api/check-status.php?checkoutRequestId=${encodeURIComponent(checkoutRequestId)}`,
      { headers: { Accept: "application/json" }, cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ status: "failed", error: "Upstream server error" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ status: data.status || "pending" });
  } catch (err) {
    console.error("Error checking order:", err);
    return NextResponse.json({ status: "failed", error: "Failed to check order" }, { status: 500 });
  }
}
