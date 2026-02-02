import tripModel from "../../../../DB/model/trip.model.js";
import { asyncHandler } from "../../../middleware/asyncHandler.js";
import cloudinary from "../../../services/cloudinary.js";

export const createTrip = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new Error("Trip images are required", { cause: 400 }));
  }
  const { title, description, duration, price, availableSeats } = req.body;
  const existingTrip = await tripModel.findOne({ title });
  if (existingTrip) {
    return next(
      new Error("Trip with this title already exists", { cause: 409 })
    );
  }
  req.body.createdBy = req.user._id;

  const images = [];
  const imagePublicIds = [];

  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `trips/${title}`,
      }
    );

    images.push(secure_url);
    imagePublicIds.push(public_id);
  }

  req.body.images = images;
  req.body.imagePublicIds = imagePublicIds;
  const trip = await tripModel.create(req.body);

  if (!trip) {
    return next(new Error("Failed to create trip", { cause: 400 }));
  }

  res.status(201).json({
    message: "Trip created successfully",
    trip,
  });
});

export const editTrip = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, duration, price, availableSeats } = req.body;
  const trip = await tripModel.findById(id);
  if (!trip) {
    return next(new Error("Trip not found", { cause: 404 }));
  }

  if (title) trip.title = title;
  if (description) trip.description = description;
  if (duration) trip.duration = duration;
  if (price) trip.price = price;
  if (availableSeats) trip.availableSeats = availableSeats;

  if (req.files && req.files.length > 0) {
    if (trip.imagePublicIds && trip.imagePublicIds.length > 0) {
      for (const public_id of trip.imagePublicIds) {
        await cloudinary.uploader.destroy(public_id);
      }
    }

    const images = [];
    const imagePublicIds = [];

    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: `trips/${trip.title}` }
      );
      images.push(secure_url);
      imagePublicIds.push(public_id);
    }

    trip.images = images;
    trip.imagePublicIds = imagePublicIds;
  }
  await trip.save();

  res.status(200).json({
    message: "Trip updated successfully",
    trip,
  });
});

export const deleteTrip = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const trip = await tripModel.findByIdAndDelete(id);
  if (!trip) {
    return next(new Error("Trip not found", { cause: 404 }));
  }
  if (trip.imagePublicIds && trip.imagePublicIds.length > 0) {
    for (const public_id of trip.imagePublicIds) {
      await cloudinary.uploader.destroy(public_id);
    }
  }

  res.status(200).json({
    message: "Trip deleted successfully",
    trip,
  });
});

export const getAllTrips = asyncHandler(async (req, res, next) => {
  const trips = await tripModel.find();
  if (trips.length === 0) {
    return next(new Error("No trips found", { cause: 404 }));
  }
  res.status(200).json({
    message: "Trips retrieved successfully",
    trips,
  });
});
export const getTripById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const trip = await tripModel.findById(id);
  if (!trip) {
    return next(new Error("Trip not found", { cause: 404 }));
  }
  res.status(200).json({
    message: "Trip retrieved successfully",
    trip,
  });
});
export const getActiveTrips = asyncHandler(async (req, res, next) => {
  const trips = await tripModel.find({ isActive: true });
  res.status(200).json({
    message: "Active trips retrieved successfully",
    trips,
  });
});
export const toggleTripStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const trip = await tripModel.findById(id);
  if (!trip) {
    return next(new Error("Trip not found", { cause: 404 }));
  }
  trip.isActive = !trip.isActive;
  await trip.save();

  res.status(200).json({
    message: `Trip is now ${trip.isActive ? "active" : "inactive"}`,
    trip,
  });
});
