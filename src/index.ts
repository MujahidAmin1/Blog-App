
import express from "express";
import "dotenv/config";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import authRoutes from "./routes/authRoutes";
import { connectDB } from "./config/database";
import morgan from "morgan";
import cors from "cors";
import blogRoutes from "./routes/blogRoutes";
import adminRoutes from "./routes/adminRoute";
import errorHandler from "./middleware/errorHandler";
import { globalLimiter, authLimiter } from "./middleware/rateLimiter";
import helmet from "helmet";

// This single line reads your .env file and loads everything into process.env. 
// It must be called before anything else that needs environment variables — that's why it's at the top.
dotenv.config();

const app = express();

app.use(helmet());
app.use(globalLimiter);
app.use(cors()); // cross origin resource sharing 
app.use(morgan("dev"));
app.use(express.json());

const port = 3000;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authLimiter ,authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);


app.get("/", (req, res) => {
  res.status(200).json({message: "Welcome to the Simple Blog API!"});
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

connectDB().catch((err)=>{
  console.log(err); 
});