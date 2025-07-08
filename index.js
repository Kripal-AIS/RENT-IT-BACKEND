import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from "mongoose";
import Auth from "./Routes/AuthRoute.js";
import User from "./Routes/UserRoute.js";
import Product from "./Routes/ProductRoute.js";
import ProductRequest from "./Routes/ProductRequestRoute.js";
import Review from "./Routes/ReviewRoute.js";
import Query from "./Routes/QueryRoute.js";
import Message from "./Routes/MessageRoute.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000','https://rent-it-frontend-ftahghbncybhbgdu.australiaeast-01.azurewebsites.net'],
  methods: ["GET", "PUT", "POST", "DELETE"],
}))
const port = process.env.PORT || 5000;






app.use("/api/auth", Auth);
app.use("/api/user", User);
app.use("/api/product", Product);
app.use("/api/review", Review)
app.use('/api/query', Query)
app.use('/api/request',ProductRequest)
app.use("/api/message", Message);






mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected With DB Successfull"))
  .catch((e) => console.log("Db Connection Failed"));


const server = app.listen(port, () => {
  console.log(`Server is Listening on PORT ${port}`);
})

