import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key from your Stripe dashboard
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };
