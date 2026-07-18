import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import { 
  UserCircleIcon, 
  BoltIcon,
  ArrowRightOnRectangleIcon,
  CreditCardIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const formatToLocalTime = (isoString) => {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function Dashboard() {
  const { user, accessToken, signOut } = useAuth()
  const [modalMessage, setModalMessage] = useState(null)
  const [usage, setUsage] = useState(null)

  const fetchUsage = async () => {
    try {
      const res = await fetch('http://localhost:8000/usage', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await res.json()
      setUsage(data)
      return data
    } catch (error) {
      console.error('Error fetching usage:', error)
    }
  }

  useEffect(() => {
    if (accessToken) fetchUsage()
  }, [accessToken])

  const testAction = async () => {
    try {
      const res = await fetch('http://localhost:8000/action', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await res.json()

      if (!res.ok) {
        setModalMessage(`${data.detail.message}. Resets at ${formatToLocalTime(data.detail.reset_at)}`)
        return
      }

      // Fetch the latest usage data after the action
      await fetchUsage()
    } catch (error) {
      console.error('Error performing action:', error)
    }
  }

  const handleUpgrade = async () => {
    try {
      const res = await fetch('http://localhost:8000/create-checkout-session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await res.json()
      window.location.href = data.checkout_url
    } catch (error) {
      console.error('Error upgrading:', error)
    }
  }

  const handleRazorpayPayment = async () => {
    try {
      const res = await fetch('http://localhost:8000/create-razorpay-order', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const order = await res.json()

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Your App Name",
        description: "Pro Plan Subscription",
        order_id: order.order_id,
        handler: function (response) {
          console.log("Payment success:", response)
          // Refresh usage data after successful payment
          fetchUsage()
        },
        prefill: {
          email: user?.email,
        },
        theme: {
          color: "#3399cc",
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Error with Razorpay:', error)
    }
  }

  const isPro = usage?.plan === 'pro'
  const usagePercentage = usage && !isPro ? (usage.usage_count / usage.limit) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition text-sm font-medium"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* User Card */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <UserCircleIcon className="w-10 h-10 text-blue-500" />
              <div>
                <h2 className="font-semibold text-gray-800">User</h2>
                <p className="text-gray-500 text-sm truncate max-w-[180px]">{user?.email}</p>
              </div>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              isPro 
                ? 'bg-amber-100 text-amber-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {isPro ? '⭐ Pro Plan' : 'Free Plan'}
            </span>
          </div>

          {/* Usage Card */}
          {usage && (
            <div className="bg-gray-50 rounded-xl p-5">
              <h2 className="font-semibold text-gray-800 mb-2">Today's Usage</h2>
              <p className="text-2xl font-bold text-gray-800">
                {usage.usage_count}
                {!isPro && (
                  <span className="text-gray-400 text-lg ml-1">/ {usage.limit}</span>
                )}
                {isPro && (
                  <span className="text-amber-500 text-lg ml-2">♾️</span>
                )}
              </p>
              {!isPro && (
                <>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.round(usagePercentage)}% used
                  </p>
                </>
              )}
              {isPro && (
                <p className="text-xs text-amber-500 mt-1">Unlimited usage ✨</p>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={testAction}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition text-sm font-medium"
          >
            <BoltIcon className="w-5 h-5" />
            Perform Action
          </button>

          {!isPro && (
            <>
              <button
                onClick={handleUpgrade}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg transition text-sm font-medium"
              >
                <StarIcon className="w-5 h-5" />
                Upgrade to Pro (Stripe)
              </button>

              <button
                onClick={handleRazorpayPayment}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg transition text-sm font-medium"
              >
                <CreditCardIcon className="w-5 h-5" />
                Upgrade with Razorpay
              </button>
            </>
          )}
        </div>

        <Modal message={modalMessage} onClose={() => setModalMessage(null)} />
      </div>
    </div>
  )
}

export default Dashboard