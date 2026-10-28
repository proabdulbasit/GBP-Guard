import { config } from '../config.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** Groq retired llama-3.1-8b-instant on 2026-08-16; use their recommended replacement. */
const FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'openai/gpt-oss-20b';

const DEPRECATED_FALLBACK_ALIASES = {
  'llama-3.1-8b-instant': 'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile': 'openai/gpt-oss-120b',
};

const resolveModel = (model) => DEPRECATED_FALLBACK_ALIASES[model] || model;

export class GroqError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GroqError';
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastCallAt = 0;
const MIN_GAP_MS = Number(process.env.GROQ_MIN_GAP_MS) || 15000;
const RETRY_WAIT_MS = Number(process.env.GROQ_RETRY_WAIT_MS) || 60000;

const parseRetryAfterMs = (body) => {
  try {
    const data = JSON.parse(body);
    const message = data?.error?.message || '';
    const match = message.match(/try again in ([\d.]+)s/i);
    if (match) return Math.ceil(Number(match[1]) * 1000) + 2000;
  } catch {
    // ignore parse errors
  }
  return RETRY_WAIT_MS;
};

const throttle = async () => {
  const wait = lastCallAt + MIN_GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastCallAt = Date.now();
};

export const parseJsonContent = (raw) => {
  let text = String(raw).trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    text = text.slice(start, end + 1);
  }
  return JSON.parse(text);
};

const callGroq = async ({ system, user, maxTokens, temperature, model }) => {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.getGroqApiKey()}`,
    },
    body: JSON.stringify({
      model: resolveModel(model),
      temperature,
      max_completion_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  const body = await response.text().catch(() => '');

  if (response.status === 429 || response.status === 413) {
    return { ok: false, retryable: true, status: response.status, body };
  }

  if (!response.ok) {
    const modelMissing =
      response.status === 404 || /model_not_found|does not exist/i.test(body);
    return {
      ok: false,
      retryable: modelMissing || response.status >= 500 || response.status === 400,
      status: response.status,
      body,
      modelMissing,
    };
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch {
    return { ok: false, retryable: true, status: 200, body: 'non-json http body' };
  }

  const choice = data?.choices?.[0];
  const content = choice?.message?.content?.trim();
  const finishReason = choice?.finish_reason || 'unknown';

  if (!content) {
    return {
      ok: false,
      retryable: true,
      status: 200,
      body: `empty response (finish_reason=${finishReason})`,
      finishReason,
    };
  }

  if (finishReason === 'length') {
    console.warn(`[groq] response truncated (finish_reason=${finishReason}, ${content.length} chars)`);
  }

  return { ok: true, content, finishReason };
};

const complete = async ({
  system,
  user,
  maxTokens = 1500,
  temperature = 0.6,
  attempts = 6,
  model = config.groqModel,
}) => {
  let lastError;
  let activeModel = resolveModel(model);
  let activeMaxTokens = maxTokens;
  const fallbackModel = resolveModel(FALLBACK_MODEL);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    await throttle();

    try {
      const result = await callGroq({
        system,
        user,
        maxTokens: activeMaxTokens,
        temperature,
        model: activeModel,
      });

      if (!result.ok) {
        const canRetry = result.retryable && attempt < attempts;
        if (canRetry) {
          if (result.body?.includes('finish_reason=length') || result.finishReason === 'length') {
            activeMaxTokens = Math.min(Math.round(activeMaxTokens * 1.5), 12000);
            console.warn(`[groq] token limit hit, increasing maxTokens to ${activeMaxTokens}`);
          }

          if (
            (result.modelMissing || result.body?.includes('empty response')) &&
            activeModel !== fallbackModel
          ) {
            console.warn(
              `[groq] ${result.modelMissing ? 'model unavailable' : 'empty response'} on ${activeModel}, switching to ${fallbackModel}`
            );
            activeModel = fallbackModel;
          }

          if (result.status === 429 || result.status === 413) {
            const waitMs = parseRetryAfterMs(result.body);
            console.warn(`[groq] rate limited, waiting ${Math.round(waitMs / 1000)}s`);
            await sleep(waitMs);
          } else {
            console.warn(`[groq] attempt ${attempt}/${attempts} failed: ${result.body.slice(0, 120)}`);
            await sleep(3000 * attempt);
          }
          continue;
        }

        throw new GroqError(`Groq ${result.status}: ${result.body.slice(0, 300)}`);
      }

      return result.content;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(3000 * attempt);
      }
    }
  }

  throw lastError;
};

export const chatText = (options) => complete({ ...options, json: false });

export const chatJSON = async (options) => {
  const jsonHint = 'Respond with exactly one valid JSON object. No markdown fences, no extra text.';

  for (let parseAttempt = 1; parseAttempt <= 3; parseAttempt += 1) {
    const raw = await complete({
      ...options,
      maxTokens: Math.max(options.maxTokens ?? 1000, 1000),
      temperature: Math.min(options.temperature ?? 0.5, 0.6),
      system: `${options.system}\n${jsonHint}`,
      user: `${options.user}\n\n${jsonHint}`,
    });

    try {
      return parseJsonContent(raw);
    } catch {
      console.warn(`[groq] JSON parse failed (attempt ${parseAttempt}/3), retrying...`);
      if (parseAttempt === 3) {
        throw new GroqError('Failed to parse JSON from Groq response after 3 attempts');
      }
    }
  }

  throw new GroqError('Failed to parse JSON from Groq response');
};
