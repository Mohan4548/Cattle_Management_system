import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Gateway routes
app.use('/api', routes);

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'FarmEase – Smart Cattle Management System API',
    timestamp: new Date().toISOString(),
  });
});

app.listen(config.port, () => {
  console.log(`🚀 FarmEase API server running on http://localhost:${config.port}`);
});
