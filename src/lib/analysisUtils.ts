export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const testGeminiModelAvailability = async (apiKey: string): Promise<string[]> => {
  const modelsToTest = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash-lite'
  ];

  const availableModels: string[] = [];

  for (const model of modelsToTest) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'test' }]
          }],
          generationConfig: {
            temperature: 0.1,
          }
        }),
      });

      if (response.ok) {
        availableModels.push(model);
      }
    } catch (error) {
      // Model not available, continue
    }
  }

  return availableModels;
};

export const analyzeFileContent = async (apiKey: string, path: string, content: string) => {
  if (!apiKey) {
    throw new Error('Please enter your Gemini API key first');
  }

  const preferredModel = (import.meta as any).env?.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
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
        if (response.status === 404) {
          throw new Error(`Model '${model}' not found. Please check if the model name is correct and available in your region.`);
        }
        throw new Error(errorData.error?.message || `Request failed (${response.status})`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis generated.';
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // List of models to try in order of preference (updated for 2024 free tier)
  const modelsToTry = [
    preferredModel,
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash-lite'
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`Trying model: ${model}`);
      return await requestOnce(model, 3000, 20000);
    } catch (error: any) {
      console.log(`Model ${model} failed:`, error.message);
      
      if (error?.message?.includes('Rate limit')) {
        await delay(30000);
        // Retry once after backoff
        try {
          return await requestOnce(model, 3000, 20000);
        } catch (retryError) {
          console.log(`Retry for ${model} also failed:`, retryError.message);
          continue; // Try next model
        }
      }
      
      // If it's a model not found error, try next model
      if (error?.message?.includes('not found') || error?.message?.includes('404')) {
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // If all models failed, throw a comprehensive error
  throw new Error(`All Gemini models failed. Tried: ${modelsToTry.join(', ')}. Please check your API key and model availability.`);
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