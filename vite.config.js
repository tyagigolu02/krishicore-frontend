import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  const repoName = process.env.GITHUB_REPOSITORY
    ? process.env.GITHUB_REPOSITORY.split('/')[1]
    : '<REPO_NAME>'

  return {
    base: command === 'build' ? `/${repoName}/` : '/',
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})