const process = require("process");
const mongoose = require("mongoose");

const app = require("./app");
const port = process.env.PORT || 5000;

const URI = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(URI).then(() => {
  console.log("Database connection successful!");
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
