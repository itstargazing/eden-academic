const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const ANTHROPIC_API_BASE = 'https://api.anthropic.com/v1/messages';

type AnthropicMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AnthropicResponse = {
  content?: Array<{
    type: string;
    text?: string;
  }>;
};

export async function sendAnthropicMessage(
  system: string,
  messages: AnthropicMessage[],
) {
  const response = await fetch(ANTHROPIC_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1400,
      system,
      messages: messages.map((message) => ({
        role: message.role,
        content: [
          {
            type: 'text',
            text: message.content,
          },
        ],
      })),
    }),
  });

  if (!response.ok) {
    throw new Error('Anthropic request failed');
  }

  const data = (await response.json()) as AnthropicResponse;
  const text = data.content?.find((item) => item.type === 'text')?.text;

  if (!text) {
    throw new Error('Anthropic response was empty');
  }

  return text;
}
