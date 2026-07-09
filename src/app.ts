import cookieParser from "cookie-parser";
import express, {Application, Request, Response} from "express";
import cors from "cors";
import config from "./config";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import requestLogger from "./middlewares/requestLogger";
import router from "./routes";

const app : Application = express();

app.use(cors({
  origin: config.app_url,
  credentials: true,
}));

app.use(requestLogger);

app.use(
  "/api/v1/payments/confirm",
  express.raw({ type: "application/json" }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "GearUp API is running",
    data: {
      name: "GearUp",
      version: "v1",
      baseUrl: "/api/v1",
      health: "/api/v1/health",
    },
  });
});

app.use("/api/v1", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;