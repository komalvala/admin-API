const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://kvala8087:komal123@cluster0.hy9nw.mongodb.net/api_flow";

mongoose.connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected successfully!!!!!");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });



