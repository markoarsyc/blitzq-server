const addNewCategory = (socket, Category) => {
  socket.on("add-category", async (UserCategory) => {
    try {
      const category = await Category.create(UserCategory);
      if (category) {
        console.log(
          `Category "${category.title}" successfully added to database`
        );
        socket.emit("add-category-status", true);
      } else {
        console.log(`An error occured when user tried to add new category`);
        socket.emit("add-category-status", false);
      }
    } catch (error) {
      console.log(error);
      socket.emit("add-category-status", false);
    }
  });
};

module.exports = addNewCategory;
