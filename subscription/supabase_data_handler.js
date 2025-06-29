Supabase Schema:**  
```sql
-- Subscription Plans Table
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(30) NOT NULL UNIQUE,
  price NUMERIC(10,2) NOT NULL,
  features JSONB NOT NULL,
  whiskey_bonus INT DEFAULT 0
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_slug VARCHAR(30) REFERENCES subscription_plans(slug) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'past_due', 'canceled')),
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample Data
INSERT INTO subscription_plans (name, slug, price, features) VALUES
  ('Prospector', 'prospector', 0.00, '["basic_market_data", "delayed_sentiment"]'),
  ('Claim Owner', 'claim-owner', 4.99, '["realtime_alerts", "nft_valuations", "land_analysis"]'),
  ('Baron', 'baron', 19.99, '["ai_trade_signals", "portfolio_stress_tests", "exclusive_land_deals"]');
```

**Stripe Webhook Handler:**  
```typescript
// File: supabase/functions/stripe-webhook.ts
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async (req: Request) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()
  
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const subscription = event.data.object as Stripe.Subscription
  const userId = subscription.metadata.user_id

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          plan_slug: subscription.metadata.plan_slug,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000),
          stripe_subscription_id: subscription.id
        })
      break
      
    case 'customer.subscription.deleted':
      await supabase
        .from('user_subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)
      break
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
```
