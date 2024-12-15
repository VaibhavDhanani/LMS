import express from 'express'
const router = express.Router();
import Stripe from 'stripe';
const stripeSecretKey = process.env.STRIPE_SECRETKEY


console.log(stripeSecretKey)

const stripe = new Stripe(stripeSecretKey);

router.post("/checkout-course",async (req,res)=>{
    const course = req.body
    const lineItems = [{
        price_data:{
            currency: "usd",
            product_data: {
                name: course.title,
                images: ["https://imgs.search.brave.com/-xm-3EXUVu0v3aVls5wGMx5e2kL3fxrr-57uApRt5GU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAzLzcyLzcyLzcx/LzM2MF9GXzM3Mjcy/NzE5MF8xT2prVzBL/YXVHeTV4cjJPVFFD/ZDU1b0JBcVoxV3px/Ti5qcGc"]
            },
            unit_amount: Math.round(course.price.discounted*100)
        },
        quantity: 1
    }]

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url : "http://localhost:5173/success",
        cancel_url: "http://localhost:5173/cancel"
    })
    res.json({id:session.id})
})

export default router