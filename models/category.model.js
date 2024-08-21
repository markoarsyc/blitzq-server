const mongoose = require("mongoose");

const TermSchema = mongoose.Schema({
  term: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
});

const CategorySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    terms: {
      type: [TermSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", CategorySchema);
module.exports = {Category,CategorySchema};
