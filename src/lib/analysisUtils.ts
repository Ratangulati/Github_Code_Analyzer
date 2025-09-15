export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeFileContent = async (apiKey: string, path: string, content: string) => {
  if (!apiKey) {
    throw new Error('Please enter your Gemini API key first');
  }

  const preferredModel = (import.meta as any).env?.VITE_GEMINI_MODEL || 'gemini-1.5-flash';

  // Keep the prompt compact and lower token usage
  const buildPrompt = (codeSnippet: string) =>
    `You are a senior code analyst. Summarize purpose, key functions/modules, and any risks.
File: ${path}
Keep it concise and actionable.

Code:
${codeSnippet}`;

  const requestOnce = async (model: string, codeLimit: number, timeoutMs: number): Promise<string> => {
    const truncatedContent = content.slice(0, codeLimit);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: buildPrompt(truncatedContent) }]
          }],
          generationConfig: {
            temperature: 0.2,
          }
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('Rate limit reached. Please wait 30 seconds before trying again.');
        }
        throw new Error(errorData.error?.message || `Request failed (${response.status})`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis generated.';
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    // First try: preferred model with moderate context and 20s timeout
    return await requestOnce(preferredModel, 3000, 20000);
  } catch (error: any) {
    if (error?.message?.includes('Rate limit')) {
      await delay(30000);
      // Retry once after backoff
      return requestOnce(preferredModel, 3000, 20000);
    }
    // Fallback: faster model + smaller context + shorter timeout
    try {
      return await requestOnce('gemini-1.5-flash', 1800, 12000);
    } catch (_) {
      throw error;
    }
  }
};

export const getFileExtension = (path: string): string => {
  const parts = path.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

export const isTextFile = (path: string): boolean => {
  const textExtensions = [
    'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'scss',
    'less', 'py', 'java', 'rb', 'php', 'c', 'cpp', 'h', 'hpp', 'sql',
    'yaml', 'yml', 'xml', 'sh', 'bash', 'zsh', 'env', 'config', 'ini'
  ];
  const ext = getFileExtension(path);
  return textExtensions.includes(ext);
};