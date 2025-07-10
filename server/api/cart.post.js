import Stripe from "stripe"
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const stripeSecret = useRuntimeConfig().stripeSecret;
  const stripe = new Stripe(stripeSecret);
  const res = await stripe.products.list({
    ids: body.products.map((product) => product.id),
  });

  const lineItems = res.data.map((product) => ({
    price: product.default_price,
    quantity: body.products.find((p) => p.id === product.id).quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    success_url: `${body.origin}/checkout/success`,
    cancel_url: `${body.origin}/cart`,
  });

  return session;
})
