/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'candy-pink': '#FFB6C1',
        'candy-blue': '#87CEEB',
        'candy-yellow': '#FFFACD',
        'candy-green': '#98FB98',
        'candy-purple': '#DDA0DD',
        'candy-orange': '#FFDAB9',
      },
      fontFamily: {
        'kid': ['Comic Sans MS', 'cursive', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      },
      borderRadius: {
        'blob': '30% 70% 70% 30% / 30% 30% 70% 70%',
      }
    },
  },
  plugins: [],
}
