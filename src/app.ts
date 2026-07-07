import cookieParser from "cookie-parser";
import express, {Application, Request, Response} from "express";
import cors from "cors";
import config from "./config";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import router from "./routes";

const app : Application = express();

app.use(cors({
  origin: config.app_url,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/v1", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;