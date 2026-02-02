import bookingModel from "../../../../DB/model/booking.model.js";
import tripModel from "../../../../DB/model/trip.model.js";
import { asyncHandler } from "../../../middleware/asyncHandler.js";

export const createBooking = asyncHandler(async (req, res, next) => {
  const {
    trip,
    seatsBooked,
    childrenSeats,
    customerName,
    customerPhone,
    fromDate,
    toDate,
    durationDays,
    sleepingArrangement,
  } = req.body;

  const userId = req.user._id;
  const tripData = await tripModel.findById(trip);
  if (!tripData) {
    return next(new Error("Trip not found", { cause: 404 }));
  }

  const totalSeats = seatsBooked + childrenSeats;
  if (tripData.availableSeats < totalSeats) {
    return next(new Error("Not enough available seats", { cause: 400 }));
  }

  const booking = await bookingModel.create({
    trip,
    user: userId,
    createdBy: userId,
    seatsBooked,
    childrenSeats,
    customerName,
    customerPhone,
    fromDate,
    toDate,
    durationDays,
    sleepingArrangement,
  });
  tripData.availableSeats -= totalSeats;
  await tripData.save();

  res.status(201).json({
    message: "Booking created successfully",
    booking,
  });
});

export const cancelBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await bookingModel.findById(id);
  if (!booking) {
    return next(new Error("Booking not found", { cause: 404 }));
  }

  if (booking.status === "cancelled") {
    return next(new Error("Booking already cancelled", { cause: 400 }));
  }

  if (booking.status === "completed") {
    return next(
      new Error("Completed booking cannot be cancelled", { cause: 400 })
    );
  }

  const trip = await tripModel.findById(booking.trip);
  if (!trip) {
    return next(new Error("Trip not found", { cause: 404 }));
  }

  const seatsToReturn = booking.seatsBooked + booking.childrenSeats;

  trip.availableSeats += seatsToReturn;
  booking.status = "cancelled";

  await booking.save();
  await trip.save();

  res.status(200).json({
    message: "Booking cancelled successfully",
    booking,
  });
});

export const completeBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await bookingModel.findById(id);
  if (!booking) {
    return next(new Error("Booking not found", { cause: 404 }));
  }

  if (booking.status === "completed") {
    return next(new Error("Booking already completed", { cause: 400 }));
  }

  if (booking.status === "cancelled") {
    return next(
      new Error("Cancelled booking cannot be completed", { cause: 400 })
    );
  }

  booking.status = "completed";
  await booking.save();

  res.status(200).json({
    message: "Booking completed successfully",
    booking,
  });
});

export const revertBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await bookingModel.findById(id);
  if (!booking) return next(new Error("Booking not found", { cause: 404 }));

  if (booking.status !== "completed") {
    return next(
      new Error("Only completed bookings can be reverted", { cause: 400 })
    );
  }

  const trip = await tripModel.findById(booking.trip);
  if (!trip) return next(new Error("Trip not found", { cause: 404 }));

  const seats = booking.seatsBooked + booking.childrenSeats;

  trip.availableSeats += seats;
  booking.status = "reverted";

  await booking.save();
  await trip.save();

  res.json({
    message: "Booking reverted successfully",
    booking,
  });
});

export const editBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await bookingModel.findById(id);
  if (!booking) {
    return next(new Error("Booking not found", { cause: 404 }));
  }

  const trip = await tripModel.findById(booking.trip);
  if (!trip) {
    return next(new Error("Trip not found", { cause: 404 }));
  }

  const {
    seatsBooked,
    childrenSeats,
    status,
    customerName,
    customerPhone,
    fromDate,
    toDate,
    durationDays,
    sleepingArrangement,
  } = req.body;

  if (seatsBooked !== undefined || childrenSeats !== undefined) {
    const oldSeats = booking.seatsBooked + booking.childrenSeats;

    const newSeats =
      (seatsBooked ?? booking.seatsBooked) +
      (childrenSeats ?? booking.childrenSeats);

    const diff = newSeats - oldSeats;

    if (diff > 0 && trip.availableSeats < diff) {
      return next(new Error("Not enough available seats", { cause: 400 }));
    }

    trip.availableSeats -= diff;
    await trip.save();

    booking.seatsBooked = seatsBooked ?? booking.seatsBooked;
    booking.childrenSeats = childrenSeats ?? booking.childrenSeats;
  }

  if (customerName) booking.customerName = customerName;
  if (customerPhone) booking.customerPhone = customerPhone;
  if (fromDate) booking.fromDate = fromDate;
  if (toDate) booking.toDate = toDate;
  if (durationDays) booking.durationDays = durationDays;
  if (sleepingArrangement) booking.sleepingArrangement = sleepingArrangement;
  if (status) {
    const validStatus = ["booked", "cancelled", "completed"];
    if (!validStatus.includes(status)) {
      return next(new Error("Invalid booking status", { cause: 400 }));
    }
    if (booking.status === "completed" && status === "cancelled") {
      const seats = booking.seatsBooked + booking.childrenSeats;
      trip.availableSeats += seats;
      await trip.save();
    }

    booking.status = status;
  }

  await booking.save();

  res.status(200).json({
    message: "Booking updated successfully",
    booking,
  });
});
