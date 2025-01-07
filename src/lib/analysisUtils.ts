export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeFileContent = async (apiKey: string, path: string, content: string) => {
  if (!apiKey) {
    throw new Error('Please enter your Gemini API key first');
  }

  // Limit content size to prevent large file issues
  const truncatedContent = content.slice(0, 5000);
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this code file and explain its purpose and functionality. File path: ${path}\n\nCode:\n${truncatedContent}`
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 429) {
        throw new Error('Rate limit reached. Please wait 30 seconds before trying again.');
      }
      
      throw new Error(errorData.error?.message || 'Failed to analyze code');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    if (error.message.includes('Rate limit')) {
      // Wait for 30 seconds before retrying on rate limit
      await delay(30000);
      return analyzeFileContent(apiKey, path, content);
    }
    throw error;
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