require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

const userRoutes = require("./router/user");
app.use(userRoutes);
const offerRoutes = require("./router/offer");
app.use(offerRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
