const { Category } = require("../models/category.model.js");

//create category
const createCategory = async (properties) => {
  try {
    const category = await Category.create(properties);
    if (category) {
      return category;
    } else {
      console.log("Failed to create category object");
    }
  } catch (error) {
    console.log(error);
  }
};

//read categories
const readAllCategories = async () => {
  try {
    const categories = Category.find();
    if (categories) {
      return categories;
    } else {
      console.error("Failed to load categories");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createCategory, readAllCategories };
