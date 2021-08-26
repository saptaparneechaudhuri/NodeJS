const mongoose = require("mongoose");
const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Enter name of a tour"],
      unique: true,
    },
    duration: {
      type: Number,
      required: [true, "Enter duration of tour"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Enter goupsize of tour"],
    },
    difficulty: {
      type: String,
      required: [true, "Enter difficulty of tour"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Enter price of tour"],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      required: [true, "Enter description of tour"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a image cover"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

toursSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

const Tour = mongoose.model("Tour", toursSchema);

module.exports = Tour;
