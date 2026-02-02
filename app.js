import express from "express";
import dotenv from "dotenv";
import connectDB from "./DB/connection.js";
import * as indexRouter from "./src/modules/indexRouter.js";

dotenv.config({ path: "./config/.env" });
const app = express();
const port = 3000;

app.use(express.json());
connectDB();

const baseUrl = process.env.BASEURL;
app.use(`${baseUrl}/auth`, indexRouter.authRouter);
app.use(`${baseUrl}/trip`, indexRouter.tripRouter);
app.use(`${baseUrl}/booking`, indexRouter.bookingRouter);

// app.use(`${baseUrl}/user`, indexRouter.userRouter);

app.use((err, req, res, next) => {
  return res.status(err.cause || 500).json({
    message: err.message || "Server Error",
    stack: err.stack,
  });
});


app.use((req, res) => res.status(404).json({ message: "Page not found" }));

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () => console.log(`Example app listening on port port!`));
