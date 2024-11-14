const functions = require("firebase-functions"); // Changed to double quotes
const express = require("express"); // Changed to double quotes
const cors = require("cors"); // Changed to double quotes
const {SecretManagerServiceClient} = require(
    "@google-cloud/secret-manager"); // Changed to double quotes

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const client = new SecretManagerServiceClient();
/**
 * Retrieves the Stripe secret key from Google Cloud Secret Manager.
 * @return {Promise<string>} The Stripe secret key.
 */
async function getStripeSecretKey() {
  const [version] = await client.accessSecretVersion({
    name:
    "projects/1072129347623/secrets/stripe-secret-key/versions/2",
  });
  return version.payload.data.toString("utf8");
}

app.post("/create-checkout-session", async (req, res) => {
  try {
    const {price, name, voucher, itemId} = req.body;
    console.log("voucher: ", voucher);
    const successUrl = `https://thriftthrive-a28e7.web.app/checkout/success/${encodeURIComponent(voucher)}/${encodeURIComponent(itemId + "" + voucher)}`;
    const stripeSecretKey = await getStripeSecretKey();
    const stripe = require("stripe")(stripeSecretKey);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Changed to double quotes
      line_items: [{
        price_data: {
          currency: "sgd", // Changed to double quotes
          product_data: {
            name: name,
          },
          unit_amount: price * 100,
        },
        quantity: 1,
      }],
      mode: "payment", // Changed to double quotes
      success_url: successUrl,
      cancel_url: `https://thriftthrive-a28e7.web.app/marketplace`,
    });

    res.json({sessionId: session.id}); // Changed to double quotes
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

// Export the API
exports.api = functions.https.onRequest(app);
