import { useEffect, useState } from "react";
import API from "../../api/axios";
import ReviewForm from "./ReviewForm";
import toast from "react-hot-toast";
import { getUserDisplayName, getUserInitial } from "../../utils/userDisplay";

export default function ReviewsSection({ listingId, listingOwnerId, user }) {
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/listings/${listingId}/reviews`);
      setReviews(res.data.data);
    } catch (err) {
      console.error("Review fetch error:", err);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await API.delete(`/listings/${listingId}/reviews/${reviewId}`);
      await fetchReviews();
      if (editingReviewId === reviewId) {
        setEditingReviewId(null);
      }
      toast.success("Review deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete review");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  const isOwner =
    user && listingOwnerId && user._id === listingOwnerId.toString();
  const currentUserReview =
    user && reviews.find((review) => review.author?._id === user._id);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Reviews</h2>

      {/* Hide review form for owner */}
      {!isOwner && user && !currentUserReview && (
        <ReviewForm listingId={listingId} onReviewAdded={fetchReviews} />
      )}

      {!isOwner && user && currentUserReview && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          You have already reviewed this listing. Use Edit on your review to update rating or description.
        </p>
      )}

      {reviews.length === 0 && (
        <p className="text-zinc-500 mt-4">No reviews yet.</p>
      )}

      <div className="space-y-6 mt-8">
        {reviews.map((review) => {
          const isReviewAuthor =
            user && review.author && user._id === review.author._id;
          const isEditing = editingReviewId === review._id;
          const reviewerName = getUserDisplayName(review.author);
          const reviewerInitial = getUserInitial(review.author);

          return (
            <div key={review._id} className="surface-card p-4 sm:p-5">
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-semibold shrink-0">
                    {reviewerInitial}
                  </div>

                  <span className="font-medium truncate">{reviewerName}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-yellow-500">
                    {"★".repeat(review.rating)}
                  </span>

                  {isReviewAuthor && (
                    <button
                      onClick={() =>
                        setEditingReviewId((prev) =>
                          prev === review._id ? null : review._id
                        )
                      }
                      className="text-zinc-600 dark:text-zinc-300 text-sm hover:underline"
                    >
                      {isEditing ? "Close" : "Edit"}
                    </button>
                  )}

                  {(isReviewAuthor || isOwner) && (
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {review.comment ? (
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">{review.comment}</p>
              ) : (
                <p className="mt-2 text-zinc-500 dark:text-zinc-400 italic">No description added.</p>
              )}

              {isEditing && (
                <div className="mt-4">
                  <ReviewForm
                    listingId={listingId}
                    mode="edit"
                    reviewId={review._id}
                    initialRating={review.rating}
                    initialComment={review.comment || ""}
                    onReviewAdded={async () => {
                      setEditingReviewId(null);
                      await fetchReviews();
                    }}
                    onCancel={() => setEditingReviewId(null)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
