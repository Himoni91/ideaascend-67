
// Define Deno variable for TypeScript
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

import { Stripe } from 'https://esm.sh/stripe@12.5.0?target=deno'

// Get Stripe API key from environment variable
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || ''

if (!stripeKey) {
  console.error('Missing STRIPE_SECRET_KEY environment variable')
}

// Initialize Stripe
export const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})
