import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seatsBooked: {
      type: Number,
      required: true,
      min: 1,
    },
    childrenSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed", "reverted"],
      default: "booked",
    },
    customerName: {
      type: String,
      trim: true,
      required: true,
    },
    customerPhone: {
      type: String,
      trim: true,
      required: true,
    },
    fromDate: {
      type: Date,
    },
    toDate: {
      type: Date,
    },
    durationDays: {
      type: Number,
      min: 1,
    },
    sleepingArrangement: {
      type: String,
      enum: ["single", "shared", "family", "hut", "none"],
    },
  },
  { timestamps: true }
);
const childrenPriceDiscount = 0.5; // 50% discount for children seats
// addition price for single,shared,family,hut sleeping arrangements can be added here
bookingSchema.pre("save", async function () {
  const trip = await mongoose.model("Trip").findById(this.trip);
  if (!trip) {
    throw new Error("Trip not found");
  }

  const sleepingArrangementPrices = {
    single: 50,
    shared: 30,
    family: 70,
    hut: 20,
    none: 0,
  };

  const adultPrice = trip.price * this.seatsBooked;
  const childrenPrice = trip.price * 0.5 * this.childrenSeats;

  this.totalPrice =
    adultPrice +
    childrenPrice +
    (sleepingArrangementPrices[this.sleepingArrangement] || 0);
});

export default mongoose.model("Booking", bookingSchema);
