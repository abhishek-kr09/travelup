import { Link } from "react-router-dom";

const BookingSuccess = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">
        
        <div className="text-green-600 text-5xl mb-4">✓</div>

        <h1 className="text-2xl font-bold mb-3">
          Booking Confirmed!
        </h1>

        <p className="text-gray-600 mb-8">
          Your payment was successful and your stay has been confirmed.
          You can view your booking details anytime.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            to="/bookings/my"
            className="bg-black text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            View My Bookings
          </Link>

          <Link
            to="/listings"
            className="border border-black py-3 rounded-xl font-medium hover:bg-black hover:text-white transition"
          >
            Explore More Listings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
