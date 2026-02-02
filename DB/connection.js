import mongoose from "mongoose";

const connectDB = async () => {
  return await mongoose
    .connect(process.env.DBURI)
    .then((res) => {
      console.log("connectDb");
    })
    .catch((err) => {
      console.log("faild to connect", err);
    });
};

export default connectDB;