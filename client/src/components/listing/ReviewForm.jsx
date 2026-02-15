import { useState } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function ReviewForm({ listingId, onReviewAdded }) {
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null; // Only logged in users can review

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || !comment) return;

    try {
      setLoading(true);

      await API.post(`/listings/${listingId}/reviews`, {
        rating,
        comment
      });

      setRating(0);
      setComment("");

      onReviewAdded(); // Refresh reviews
    } catch (err) {
      console.error("Review error:", err);
      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-6 bg-gray-50 dark:bg-zinc-900">
      <h3 className="font-semibold mb-4">Leave a review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Stars */}
        <div className="flex gap-2 text-2xl cursor-pointer">
          {[1,2,3,4,5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={star <= rating ? "text-yellow-500" : "text-gray-400"}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Write your experience..."
          className="w-full border rounded-lg p-3 dark:bg-zinc-800"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

      </form>
    </div>
  );
}
