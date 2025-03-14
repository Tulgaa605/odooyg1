const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const KHAN_BANK_API = {
  TEST: 'https://developer.khanbank.com/v1/payment',
  PROD: 'https://api.khanbank.com/v1/payment'
};

const MERCHANT_ID = process.env.KHAN_BANK_MERCHANT_ID;
const API_KEY = process.env.KHAN_BANK_API_KEY;

exports.createPayment = async (req, res) => {
  try {
    const { amount, description, userId } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'mnt',
      description: description,
      metadata: {
        userId: userId
      }
    });

    // Save payment info to database
    const payment = await prisma.payment.create({
      data: {
        amount: amount / 100, // Convert from cents to MNT
        description,
        userId,
        status: 'pending',
        stripePaymentId: paymentIntent.id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id
    });

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Stripe webhook handler
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await prisma.payment.update({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: 'completed' }
      });
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await prisma.payment.update({
        where: { stripePaymentId: failedPayment.id },
        data: { status: 'failed' }
      });
      break;
  }

  res.json({ received: true });
}; 