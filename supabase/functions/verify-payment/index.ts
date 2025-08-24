// functions/verify-payment/index.ts
export default async (req: Request) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers:{ "Content-Type":"application/json"}});
    }

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) return new Response(JSON.stringify({ error: "Key secret not set" }), { status:500, headers:{ "Content-Type":"application/json"}});

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const enc = new TextEncoder();
    const keyData = enc.encode(keySecret);
    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(payload));
    const generatedSignature = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const verified = generatedSignature === razorpay_signature;
    return new Response(JSON.stringify({ verified }), { headers: { "Content-Type": "application/json" }});
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status:500, headers: { "Content-Type":"application/json" }});
  }
};
