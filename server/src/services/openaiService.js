import { getOpenAIClient, getModelName } from '../config/openai.js';

export const SYSTEM_TONE_INSTRUCTIONS = {
  Professional: 'Respond in a professional, structured, and clear manner.',
  Casual: 'Respond naturally, conversationally, and in a friendly tone.',
  Concise: 'Respond briefly, directly, and focus on essential information.',
};

/**
 * Returns the system instruction for a given tone.
 */
export const getSystemInstructionForTone = (tone) => {
  return (
    SYSTEM_TONE_INSTRUCTIONS[tone] ||
    SYSTEM_TONE_INSTRUCTIONS.Professional
  );
};

/**
 * Creates an OpenAI chat completion stream using the official SDK.
 *
 * @param {Object} options
 * @param {string} options.tone - 'Professional' | 'Casual' | 'Concise'
 * @param {Array<{role: string, content: string}>} options.history - Message history
 * @param {AbortSignal} [options.signal] - AbortSignal for cancellation
 * @returns {Promise<AsyncIterable>} - OpenAI stream iterable
 */
export const createChatCompletionStream = async ({
  tone = 'Professional',
  history = [],
  signal,
}) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error(
      'OPENAI_API_KEY is not configured. Please set your OpenAI API key in the server .env file.'
    );
  }

  const client = getOpenAIClient();
  const model = getModelName();
  const systemInstruction = getSystemInstructionForTone(tone);

  const messages = [
    { role: 'system', content: systemInstruction },
    ...history,
  ];

  const stream = await client.chat.completions.create(
    {
      model,
      messages,
      stream: true,
      temperature: tone === 'Concise' ? 0.3 : tone === 'Casual' ? 0.8 : 0.6,
    },
    { signal }
  );

  return stream;
};
