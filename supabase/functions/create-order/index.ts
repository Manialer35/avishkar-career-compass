// functions/create-order/index.ts
export default async (req: Request) => {
  try {
    const body = await req.json();
    const amountRs = Number(body.amount);
    if (!amountRs || isNaN(amountRs)) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400, headers:{ "Content-Type": "application/json"}});
    }

    const amountPaise = Math.round(amountRs * 100); // Razorpay expects paise
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      return new Response(JSON.stringify({ error: "Razorpay keys not configured" }), { status: 500, headers:{ "Content-Type": "application/json"}});
    }

    const auth = btoa(`${keyId}:${keySecret}`);
    const resp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        payment_capture: 1
      })
    });

    const data = await resp.json();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
};
