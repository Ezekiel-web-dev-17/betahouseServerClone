import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { STRIPE_SECRET_KEY } from "../config/env.js";
dotenv.config();

const router = express.Router();
const stripe = new Stripe(STRIPE_SECRET_KEY);

// POST /create-checkout-session
router.post("/create-checkout-session", async (req, res) => {
  const { amount, propertyId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Property ID: ${propertyId}`,
            },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://betahouse3.vercel.app/success`,
      cancel_url: `https://betahouse3.vercel.app/cancel`,
    });

    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
