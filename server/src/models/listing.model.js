import mongoose from "mongoose";
import Review from "./review.model.js"; // Note: Added .js extension

const Schema = mongoose.Schema;

const CATEGORY_OPTIONS = [
  "Rooms",
  "Iconic cities",
  "Mountains",
  "Castles",
  "Amazing pools",
  "Camping",
  "Farms"
];

const listingSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    image: {
      url: {
        type: String,
        default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
      },
      filename: String
    },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    country: { type: String, required: true },
    category: {
      type: String,
      enum: CATEGORY_OPTIONS,
      default: "Rooms"
    },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    geometry: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true }
    }
  },
  { timestamps: true }
);

// Cascade delete reviews
listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

// Change this line:
export default Listing; 
