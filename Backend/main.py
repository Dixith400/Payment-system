from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user
# from file name and import and function name 
from quota import check_and_use_quota, get_usage_status
from stripe_payments import create_checkout_session
from db import supabase_admin
import os
import stripe
import razorpay
import hmac
import hashlib
from razorpay_payments import create_order, razorpay_client


app = FastAPI()

# Allow your React dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # adjust if your Vite port differs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/protected")
def protected_route(user=Depends(get_current_user)):
    return {
        "message": "You are authenticated!",
        "user_id": user["sub"],
        "email": user.get("email"),
    }



@app.get("/action")
def do_limited_action(user=Depends(get_current_user)):
    usage = check_and_use_quota(user["sub"])
    return {
        "message": "Action performed!",
        "usage_count": usage["usage_count"],
        "limit": 5,
    }


@app.get("/usage")
def usage_status(user=Depends(get_current_user)):
    usage = get_usage_status(user["sub"])
    return {
        "usage_count": usage["usage_count"],
        "limit": 5,
        "reset_at": usage["reset_at"],
        "plan": usage["plan"]
    }


@app.post("/create-checkout-session")
def checkout(user=Depends(get_current_user)):
    url = create_checkout_session(user["sub"], user.get("email"))
    return {"checkout_url": url}



STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@app.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["client_reference_id"]

        supabase_admin.table("user_usage").update({
        "plan": "pro"
        }).eq("user_id", user_id).execute()

        print(f"Upgraded user {user_id} to pro")

    return {"status": "success"}

#razorpay

from razorpay_payments import create_order

@app.post("/create-razorpay-order")
def razorpay_order(user=Depends(get_current_user)):
    order = create_order(amount_in_paise=19900, user_id=user["sub"])
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": os.getenv("RAZORPAY_KEY_ID"),
    }



RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

@app.post("/webhook/razorpay")
async def razorpay_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("x-razorpay-signature")

    expected_signature = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, sig_header):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event = await request.json()

    if event["event"] == "payment.captured":
        payment = event["payload"]["payment"]["entity"]
        order_id = payment["order_id"]

        order = razorpay_client.order.fetch(order_id)
        user_id = order["notes"]["user_id"]

        supabase_admin.table("user_usage").update({
            "plan": "pro"
        }).eq("user_id", user_id).execute()

        print(f"Razorpay: Upgraded user {user_id} to pro")

    return {"status": "success"}