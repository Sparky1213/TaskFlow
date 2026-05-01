import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors({origin:'*'}));
app.use(express.json());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/dashboard", dashboardRoutes);

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on ${PORT}`);
});
