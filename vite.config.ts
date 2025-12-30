import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // For GitHub Pages, use the repository name as base path
    // Set GITHUB_REPOSITORY_NAME env var or it defaults to 'shelfie'
    // For user/organization pages, set base to '/'
    const repoName =
      env.GITHUB_REPOSITORY_NAME || process.env.GITHUB_REPOSITORY_NAME;
    const base = repoName ? `/${repoName}/` : '';
 
    return {
      base,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
    };
});
