const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");

const app = express();
app.use(formidable());

mongoose.connect("mongodb://127.0.0.1/vinted");

const userRoutes = require("./router/user");
app.use(userRoutes);
const offerRoutes = require("./router/offer");
app.use(offerRoutes);

app.listen(3000, () => {
  console.log("Server has started");
});
