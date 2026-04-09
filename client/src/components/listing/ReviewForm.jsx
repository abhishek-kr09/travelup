import { useState } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function ReviewForm({ listingId, onReviewAdded }) {
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null; // Only logged in users can review

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || !comment) {
      toast.error("Please add rating and comment");
      return;
    }

    try {
      setLoading(true);

      await API.post(`/listings/${listingId}/reviews`, {
        rating,
        comment,
      });

      setRating(0);
      setComment("");

      onReviewAdded(); // Refresh reviews
      toast.success("Review submitted");
    } catch (err) {
      console.error("Review error:", err);
      toast.error(err?.response?.data?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-6">
      <h3 className="font-semibold mb-4">Leave a review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Stars */}
        <div className="flex gap-2 text-2xl cursor-pointer">
          {[1, 2, 3, 4, 5].map((star) => (
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
          className="w-full border border-stone-300 dark:border-zinc-700 rounded-lg p-3 bg-stone-100 dark:bg-zinc-800"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
