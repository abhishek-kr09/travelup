import { useState } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function ReviewForm({
  listingId,
  onReviewAdded,
  mode = "create",
  reviewId,
  initialRating = 0,
  initialComment = "",
  onCancel,
}) {
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRating(initialRating || 0);
    setComment(initialComment || "");
  }, [initialRating, initialComment, reviewId]);

  if (!user) return null; // Only logged in users can review

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error("Please select a star rating");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        rating,
        description: comment,
      };

      if (mode === "edit") {
        await API.put(`/listings/${listingId}/reviews/${reviewId}`, payload);
      } else {
        await API.post(`/listings/${listingId}/reviews`, payload);
      }

      setRating(0);
      setComment("");

      onReviewAdded();
      toast.success(mode === "edit" ? "Review updated" : "Review submitted");
    } catch (err) {
      console.error("Review error:", err);
      toast.error(
        err?.response?.data?.message ||
          (mode === "edit" ? "Failed to update" : "Failed to submit")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-6">
      <h3 className="font-semibold mb-4">
        {mode === "edit" ? "Edit your review" : "Leave a review"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Rating</p>
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

        <p className="text-sm text-zinc-500 dark:text-zinc-400">Description</p>
        <textarea
          placeholder="Describe your experience..."
          className="w-full border border-stone-300 dark:border-zinc-700 rounded-lg p-3 bg-stone-100 dark:bg-zinc-800"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            {loading
              ? mode === "edit"
                ? "Updating..."
                : "Submitting..."
              : mode === "edit"
              ? "Update"
              : "Submit"}
          </button>

          {mode === "edit" && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
