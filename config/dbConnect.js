/* eslint-disable no-undef */

const mongoose = require("mongoose");

const dbConnect= async ()=>{
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB connected successfully");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

dbConnect();
