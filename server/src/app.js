import express from 'express';
import cors from 'cors';
import conversationRoutes from './routes/conversationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
