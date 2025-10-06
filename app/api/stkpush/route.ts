// app/api/stkpush/route.ts
import { NextResponse } from "next/server";

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error("❌ Non-JSON response:", text);
    throw new Error("Expected JSON but got non-JSON response");
  }
}

export async function POST(req: Request) {
  try {
    const bodyText = await req.text(); // read raw
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      console.error("❌ Bad JSON from client:", bodyText);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { amount, phone, orderId, cart } = body;

    // ✅ Validate payload
    if (amount === undefined || !phone || orderId === undefined) {
      return NextResponse.json(
        { error: "Missing amount, phone, or orderId" },
        { status: 400 }
      );
    }

    // 🔑 Generate M-Pesa access token
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );

    const tokenData = await safeJson(tokenRes);

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "Auth failed", details: tokenData },
        { status: 401 }
      );
    }

    const access_token = tokenData.access_token;

    // 🔹 Prepare STK Push request
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const stkReq = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: `Order${orderId}`,
      TransactionDesc: "Checkout payment",
    };

    const stkRes = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkReq),
      }
    );

    const stkData = await safeJson(stkRes);

    if (!stkData.CheckoutRequestID) {
      return NextResponse.json(
        { error: "No CheckoutRequestID received", details: stkData },
        { status: 400 }
      );
    }

    // ✅ Return only the essentials
    return NextResponse.json({
      success: true,
      checkoutRequestId: stkData.CheckoutRequestID,
      merchantRequestId: stkData.MerchantRequestID,
      customerMessage: stkData.CustomerMessage,
    });
  } catch (err: any) {
    console.error("STK push error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
