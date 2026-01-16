export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c',
        sidebar: '#111114',
        accent: '#3b82f6',
        secondary: '#1e293b',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'gradient-accent': 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
      }
    },
  },
  plugins: [],
}
