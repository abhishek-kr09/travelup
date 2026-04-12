import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      default: ""
    },
    lastName: {
      type: String,
      trim: true,
      default: ""
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual("fullName").get(function () {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

const User = mongoose.model("User", userSchema);

// Change this line from module.exports:
export default User;
