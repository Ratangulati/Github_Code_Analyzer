# GitHub Code Analyzer - Setup Instructions

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **GitHub Personal Access Token**
3. **Google Gemini API Key**

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# GitHub API Configuration
# Get your token from: https://github.com/settings/tokens
# Required scopes: repo (for private repos) or public_repo (for public repos only)
VITE_GITHUB_TOKEN=your_github_token_here

# Gemini API Configuration  
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Specify Gemini model (defaults to gemini-1.5-flash)
VITE_GEMINI_MODEL=gemini-1.5-flash
```

### 3. Get GitHub Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - For public repos only: `public_repo`
   - For private repos: `repo`
4. Copy the token and add it to your `.env` file

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. Enter a GitHub repository URL (e.g., `https://github.com/facebook/react`)
2. Click "Analyze" to fetch repository information and structure
3. Click on any file in the file tree to get AI-powered analysis
4. Use the "Back to Search" button to analyze a different repository

## Troubleshooting

### Common Issues

1. **Rate Limit Exceeded**: 
   - Add a GitHub token to increase rate limits
   - Wait for the rate limit to reset

2. **API Key Not Found**:
   - Ensure your `.env` file is in the root directory
   - Restart the development server after adding environment variables
   - Check that variable names start with `VITE_`

3. **Repository Not Found**:
   - Ensure the repository URL is correct
   - Check if the repository is private and you have access
   - Verify your GitHub token has the correct permissions

4. **File Analysis Fails**:
   - Check your Gemini API key is valid
   - Ensure you have sufficient API quota
   - Some files may be too large for analysis

### Development

- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type Check**: `npm run typecheck`
- **Test**: `npm run test`
