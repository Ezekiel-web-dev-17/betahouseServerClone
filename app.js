import cookieParser from "cookie-parser";
import express from "express";
import authRoute from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { PORT, STRIPE_SECRET_KEY } from "./config/env.js";
import { connectDb } from "./database/mongodb.js";
import authorize from "./middlewares/auth.middleware.js";
import cors from "cors";
import router from "./routes/checkout.routes.js";

const app = express();
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// ✅ CORS CONFIGURATION
app.use(
  cors({
    origin: ["http://localhost:5173", "https://betahouse3.vercel.app"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/checkout", router);
app.use(authorize);
app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectDb();
});

export default app;
