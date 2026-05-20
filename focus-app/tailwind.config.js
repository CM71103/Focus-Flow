/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#f5f0e8',
        accent: '#c9a96e',
        surface: '#ffffff',
        surface2: '#faf7f2',
        muted: '#6b7280',
      },
    },
  },
  plugins: [],
}
