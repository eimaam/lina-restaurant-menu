import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Lina Restaurant API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Connect DB and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Lina Restaurant Server running on http://localhost:${PORT}`);
    console.log(`API endpoints mounted on http://localhost:${PORT}/api`);
  });
});

export default app;
