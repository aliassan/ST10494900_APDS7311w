// server/src/config/https.config.ts
import fs from 'fs';
import path from 'path';

export const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '../../certs/backend-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, '../../certs/backend-cert.pem')),
};