import express from "express";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config/env.js";
import authorize from "../middlewares/auth.middleware.js";

const checkOutRoute = express.Router();
const stripe = new Stripe(STRIPE_SECRET_KEY);

const calculateOrderAmount = (items) => {
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  let total = 0;
  items.forEach((item) => {
    total += item.amount;
  });
  return total;
};

checkOutRoute.post("/create-payment-intent", authorize, async (req, res) => {
  try {
    const { items } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items) * 100,
      currency: "ngn",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).send({ error: error.message });
  }
});

export default checkOutRoute;
