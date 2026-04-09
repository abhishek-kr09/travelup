import mongoose from "mongoose";
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  }
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
