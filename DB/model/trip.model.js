import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [3, "Min length is 3"],
      maxlength: [100, "Max length is 100"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Min length is 10"],
      maxlength: [1000, "Max length is 1000"],
      trim: true,
    },
    // duration: {
    //   type: Number,
    //   required: [true, "Duration is required"],
    //   min: [1, "Duration must be at least 1 day"],
    // },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    availableSeats: {
      type: Number,
      required: [true, "Available seats are required"],
      min: [1, "Available seats must be at least 1"],
    },
    images: {
      type: [String],
      default: [],
    },
    imagePublicIds: [String],
    slug: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);
