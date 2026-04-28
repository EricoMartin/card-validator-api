import express from "express";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import cardRoutes from "./routes/card.routes";

const app = express();

app.use(express.json());
app.use("/api/v1/cards", cardRoutes);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use(notFoundHandler);

app.use(errorHandler);

export default app;