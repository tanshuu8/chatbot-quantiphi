import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from server directory as well as current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Creates/returns the configured OpenAI instance dynamically
 * to ensure latest environment variables are always respected.
 */
export const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  const clientOptions = {
    apiKey: apiKey || 'missing-key',
  };

  if (process.env.OPENAI_BASE_URL) {
    clientOptions.baseURL = process.env.OPENAI_BASE_URL;
  }

  return new OpenAI(clientOptions);
};

export const getModelName = () => {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
};
