import express from "express";
import { errorHandler } from "./middlewares/error.middleware";
import cardRoutes from "./routes/card.routes";

const app = express();

app.use(express.json());
app.use(errorHandler);
app.use("/api/v1/cards", cardRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;