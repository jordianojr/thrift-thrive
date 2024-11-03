const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const client = new SecretManagerServiceClient();

async function getStripeSecretKey() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/1072129347623/secrets/stripe-secret-key/versions/2',
  });
  return version.payload.data.toString('utf8');
}

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { price, name } = req.body;
    const stripeSecretKey = await getStripeSecretKey();
    const stripe = require("stripe")(stripeSecretKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "sgd",
          product_data: {
            name: name,
          },
          unit_amount: price * 100,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `https://thriftthrive-a28e7.web.app/checkout/success`,
      cancel_url: `https://thriftthrive-a28e7.web.app/marketplace`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export the API
exports.api = functions.https.onRequest(app);
