import mongoose from "mongoose";

const emailOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const EmailOtp = mongoose.model("EmailOtp", emailOtpSchema);

export default EmailOtp;