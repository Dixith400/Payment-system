import os
import stripe
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID")

def create_checkout_session(user_id: str, user_email: str):
    session = stripe.checkout.Session.create(
        mode="subscription",
        payment_method_types=["card"],
        line_items=[{
            "price": STRIPE_PRICE_ID,
            "quantity": 1,
        }],
        customer_email=user_email,
        client_reference_id=user_id,
        success_url="http://localhost:5173/success",
        cancel_url="http://localhost:5173/dashboard",
    )
    return session.url