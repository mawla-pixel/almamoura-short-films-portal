import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBunnyVideosHandler } from './server/bunnyApi.js';

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.join(currentDirectory, 'dist');

app.get('/api/bunny/videos', createBunnyVideosHandler());
app.use(express.static(distDirectory));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDirectory, 'index.html'));
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Short film portal listening on port ${port}`);
});
