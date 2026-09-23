import express from "express";
import authRouter from "./routes/authRoutes.js";
import bookRouter from "./routes/bookRoutes.js";
import pageRouter from "./routes/pageRoutes.js";
import { FRONTEND_URL, PORT } from "./utils/constants.js";
import morgan from "morgan";
import { connectDb } from "./config/database.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { startCollaborationServer } from "./collaboration/server.js";

const app = express();

connectDb();

const corsOptions = {
  origin: FRONTEND_URL() || "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth/", authRouter);
app.use("/api/books/", bookRouter);
app.use("/api/pages/", pageRouter);

app.listen(PORT, () => console.log(`Server started running on port ${PORT}`));
startCollaborationServer(Number(process.env.YJS_PORT || 1234));

