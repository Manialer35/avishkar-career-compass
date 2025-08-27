// server/api/payments.ts
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { supabase } from '../services/supabaseAdmin';

const router = express.Router();

// Initialize Razorpay with your key ID and key secret
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const {
      amount,
      currency = 'INR',
      productId,
      productName,
      customerId,
    } = req.body;

    if (!amount || !productId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create unique receipt ID using product ID and timestamp
    const receipt = `order_${productId}_${Date.now()}`;

    const options = {
      amount: amount, // amount in smallest currency unit (paise for INR)
      currency,
      receipt,
      notes: {
        productId,
        productName,
        customerId,
      },
    };

    const order = await razorpay.orders.create(options);

    // Store order information in the database
    const { error } = await supabase
      .from('payment_orders')
      .insert({
        order_id: order.id,
        product_id: productId,
        user_id: customerId,
        amount: amount / 100, // Convert back to main currency unit for storing
        currency,
        status: 'created',
      });

    if (error) {
      console.error('Error storing order:', error);
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      productId,
    } = req.body;

    // Verify the payment signature
    const payload = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(payload)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update payment status in the database
    const { error } = await supabase
      .from('payment_orders')
      .update({
        status: 'completed',
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', razorpay_order_id);

    if (error) {
      console.error('Error updating payment status:', error);
      return res.status(500).json({ success: false, message: 'Failed to update payment status' });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
});

// Get payment status
router.get('/status/:paymentId', async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    
    const payment = await razorpay.payments.fetch(paymentId);
    
    return res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

export default router;
