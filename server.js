require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.static('public'));

// Webhook route MUST come before express.json()
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment succeeded:', session.id);
    // TODO: Send download link email here
  }

  res.json({ received: true });
});

// Now add express.json() for other routes
app.use(express.json());

// Rest of your code...

app.use(express.static('public'));

// Webhook route MUST come before express.json()
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment succeeded:', session.id);
    // TODO: Send download link email here
  }

  res.json({ received: true });
});

// Now add express.json() for other routes
app.use(express.json());

// Rest of your code...require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.static('public'));
app.use(express.json());

const PACKAGES = {
  blue: { name: 'Blue Icons', price: 0, priceId: null },
  red: { name: 'Red Icons', price: 49, priceId: 'price_red' },
  green: { name: 'Green Icons', price: 149, priceId: 'price_green' },
  yellow: { name: 'Yellow Icons', price: 249, priceId: 'price_yellow' },
  purple: { name: 'Purple Icons', price: 349, priceId: 'price_purple' },
  orange: { name: 'Orange Icons', price: 449, priceId: 'price_orange' }
};

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { packageId } = req.body;
    const package = PACKAGES[packageId];

    if (!package) {
      return res.status(400).json({ error: 'Invalid package' });
    }

    if (package.price === 0) {
      return res.json({ 
        success: true, 
        free: true,
        message: 'Free package - no payment needed'
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: package.name,
            description: `NVUS ${package.name} Package`
          },
          unit_amount: package.price
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://your-domain.com'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://your-domain.com'}/`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('Payment succeeded:', paymentIntent.id);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
