# Stripe Integration Setup

## Frontend Environment Variables

Create a `.env` file in the `chefenplace-web` directory with:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Backend Environment Variables

Add these to your backend `.env` file:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:5173
```

## Stripe Dashboard Setup

1. **Create Products in Stripe Dashboard:**
   - Pro Monthly: $49/month
   - Pro Yearly: $490/year (or $40.83/month)
   - Enterprise Monthly: $99/month
   - Enterprise Yearly: $990/year

2. **Price IDs:**
   - ✅ Pro Monthly: `price_your_price_id_here` (configured)
   - Other plans using same price ID for testing

3. **Set up Webhook:**
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook secret to your backend `.env`

## Testing

1. Use Stripe test cards for testing:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

2. The integration will redirect to Stripe checkout when users select a paid plan during signup.

## Current Features

- ✅ Plan selection during restaurant signup
- ✅ Stripe checkout integration
- ✅ Webhook handling for subscription events
- ✅ Trial plan (no payment required)
- ✅ Monthly/Yearly billing cycles

## Next Steps

- Update price IDs with your actual Stripe product IDs
- Set up webhook endpoint
- Test the complete flow
- Add subscription management in the dashboard 