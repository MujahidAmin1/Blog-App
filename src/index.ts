
import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import authRoutes from "./routes/authRoutes";
import { connectDB } from "./config/database";
import morgan from "morgan";
import cors from "cors";
import blogRoutes from "./routes/blogRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const port = 3000;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

app.get("/", (req, res) => {
  res.status(200).json({message: "Welcome to the Simple Blog API!"});
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

connectDB().catch((err)=>{
  console.log(err); 
});