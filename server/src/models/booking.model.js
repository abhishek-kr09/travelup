import mongoose from "mongoose";
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, min: 1, default: 1 },
    pricePerNight: { type: Number, required: true },
    nights: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeSessionId: {
      type: String,
      sparse: true,
      index: true,
    },
    cancellationReason: { type: String },
    refundAmount: { type: Number },
    confirmationEmailSentAt: { type: Date },
    cancellationEmailSentAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ listing: 1, status: 1 });

export default mongoose.model("Booking", bookingSchema);