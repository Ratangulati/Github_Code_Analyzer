# GitHub Repository Analyzer

A powerful tool to analyze GitHub repositories using AI. This project helps developers understand codebases better by providing detailed analysis of repository structure and code patterns.

## Features

- Repository structure visualization
- Detailed code analysis for each file
- Repository statistics and information
- AI-powered insights using Google's Gemini API

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd repo-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Gemini API key:
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Replace the `GEMINI_API_KEY` constant in `src/components/CodeAnalysis.tsx`

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:8080](http://localhost:8080) in your browser

## How to Use

1. Enter a GitHub repository URL in the search box
2. Click "Analyze" to fetch repository information
3. Explore the repository structure in the file tree
4. Click on individual files to get AI-powered analysis

## Technologies Used

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Google Gemini API
- GitHub API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.