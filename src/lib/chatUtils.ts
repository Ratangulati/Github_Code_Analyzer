export const askAboutFile = async (
  apiKey: string,
  model: string,
  path: string,
  codeContent: string,
  question: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('Please enter your Gemini API key first');
  }

  const selectedModel = model || 'gemini-1.5-flash';

  const buildPrompt = (codeSnippet: string) =>
    `You are a senior code assistant. Answer the user's question precisely using the provided file's code. If unknown, say so.
File: ${path}
Question: ${question}

Code:
${codeSnippet}`;

  const truncated = codeContent.slice(0, 3000);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: buildPrompt(truncated) }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to get answer');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.';
};


