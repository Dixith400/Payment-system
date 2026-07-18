import os
import razorpay
from dotenv import load_dotenv

load_dotenv()

razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)

def create_order(amount_in_paise: int, user_id: str):
    order = razorpay_client.order.create({
        "amount": amount_in_paise,
        "currency": "INR",
        "notes": {
            "user_id": user_id
        }
    })
    return order