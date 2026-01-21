const express = require('express');
const app = express();
const cors = require('cors'); 
require('dotenv').config();

const db=require('./db');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
db();
app.get('/', (req, res) => {
    res.send('Hello, BGMI Room Backend is running!');
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { slot } = req.body;
    
    if (!slot) {
      return res.status(400).json({ error: 'Slot information is required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `BGMI Slot - ${slot}`,
          },
          unit_amount: 10000, // ₹100 in paise
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,
    });
    
    // Return the URL instead of just the ID
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});
app.use("/api/room", require("./Routes/Room"));
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});