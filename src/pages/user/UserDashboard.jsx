export default function UserDashboard() {
  return (
    <div className="bg-gray-100 text-gray-900">
      Simple Home Page{" "}
      <button class="bg-blue-600 text-white px-6 py-3 rounded-xl">
        Continue
      </button>
      <div class="bg-blue-50 border-blue-100 p-4 rounded-xl">
        Blue tinted info box
      </div>
      <p class="text-blue-600 font-medium">View Transactions</p>
      <p class="text-green-600">Deposit Successful</p>
      <span class="bg-green-50 text-green-700 px-2 py-1 rounded-lg">
        20% OFF
      </span>
      <div class="border border-green-300 bg-white p-4 rounded-xl">
        Verified
      </div>
      <span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-sm">
        Limited Time Offer
      </span>
      <div class="text-orange-600 font-semibold">Only 3 left!</div>
      <button class="border border-orange-500 text-orange-600 px-4 py-2 rounded-xl">
        View Deal
      </button>
      <p class="text-red-600 font-medium">Payment failed. Try again.</p>
      <div class="bg-red-50 border border-red-200 p-4 rounded-xl">
        Something went wrong
      </div>
      <button class="text-red-600 border border-red-600 px-4 py-2 rounded-xl">
        Delete Item
      </button>
      <button class="bg-primary text-white rounded-xl px-6 py-3">
        Continue
      </button>
      <p class="text-success font-semibold">Payment Successful</p>
      <div class="bg-warning text-white p-3 rounded-xl">
        Limited Time Offer!
      </div>
      <p class="text-danger">Your payment failed</p>
      <div class="bg-gradient-soft p-6 rounded-2xl shadow">
        Deposit Confirmed
      </div>
      <button
        class="
    bg-gray-100
    text-gray-900
    font-medium
    px-6
    py-3
    rounded-xl
    active:scale-[0.97]
    transition-all
  "
      >
        Try Again
      </button>
      <button
        class="
    bg-white
    text-gray-900
    border
    border-gray-200
    font-medium
    px-6
    py-3
    rounded-xl
    active:scale-[0.97]
    transition-all
  "
      >
        Dismiss
      </button>
      <button
        disabled
        class="
    bg-gray-200
    text-gray-500
    font-semibold
    px-6
    py-3
    rounded-xl
    opacity-60
    cursor-not-allowed
  "
      >
        Continue
      </button>
      <button
        class="
    bg-success
    text-white
    font-semibold
    px-6
    py-3
    rounded-xl
    shadow-success
    active:scale-[0.97]
    transition-all
  "
      >
        Verified
      </button>
      <button
        class="
    bg-danger
    text-white
    font-semibold
    px-6
    py-3
    rounded-xl
    shadow-danger
    active:scale-[0.97]
    transition-all
  "
      >
        Delete
      </button>
      <button
        class="
    bg-warning
    text-white
    font-semibold
    px-6
    py-3
    rounded-xl
    shadow-warning
    active:scale-[0.97]
    transition-all
  "
      >
        Claim Offer
      </button>
      {/* <button
  class="
    w-10
    h-10
    rounded-full
    bg-[#1A1A1A]
    text-white
    flex
    items-center
    justify-center
    active:scale-[0.9]
    transition
  "
>
  <svg><!-- icon --></svg>
</button> */}
      <button
        class="
    bg-black-800
    hover:bg-black-900
    active:bg-black-900
    text-white
    font-semibold
    px-6
    py-3
    rounded-xl
    w-full
    active:scale-[0.97]
    transition-all
    shadow-card
  "
      >
        Continue
      </button>
      <button
        class="
    bg-primary 
    hover:bg-primary-hover 
    text-white 
    font-semibold 
    px-6 
    py-3 
    rounded-xl 
    w-full 
    active:scale-[0.97] 
    transition-all 
    shadow-primary
  "
      >
        Continue
      </button>
    </div>
  );
}
