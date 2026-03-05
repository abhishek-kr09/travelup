import { useEffect, useState } from "react";
import API from "../../api/axios";
import ReviewForm from "./ReviewForm";

export default function ReviewsSection({ listingId, listingOwnerId, user }) {
  const [reviews, setReviews] = useState([]);

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
      fetchReviews();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  const isOwner =
    user && listingOwnerId && user._id === listingOwnerId.toString();

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Reviews</h2>

      {/* Hide review form for owner */}
      {!isOwner && user && (
        <ReviewForm listingId={listingId} onReviewAdded={fetchReviews} />
      )}

      {reviews.length === 0 && (
        <p className="text-gray-500 mt-4">No reviews yet.</p>
      )}

      <div className="space-y-6 mt-8">
        {reviews.map((review) => {
          const isReviewAuthor =
            user && review.author && user._id === review.author._id;

          return (
            <div key={review._id} className="border rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span>{review.author?.username}</span>

                <div className="flex items-center gap-3">
                  <span className="text-yellow-500">
                    {"★".repeat(review.rating)}
                  </span>

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

              <p className="mt-2">{review.comment}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
