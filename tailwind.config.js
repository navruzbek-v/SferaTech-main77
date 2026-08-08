/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0D1117',
        card: '#161B22',
        cardhi: '#1C2230',
        line: '#232A36',
        neon: '#4ADE80',
        tg: '#38BDF8',
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      keyframes: {
        pop: { '0%': { transform: 'scale(.96)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        slideup: { '0%': { transform: 'translateY(24px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseg: { '0%,100%': { boxShadow: '0 0 0 0 rgba(74,222,128,.5)' }, '50%': { boxShadow: '0 0 0 14px rgba(74,222,128,0)' } },
      },
      animation: {
        pop: 'pop .18s ease-out',
        slideup: 'slideup .25s ease-out',
        pulseg: 'pulseg 1.6s infinite',
      },
    },
  },
  plugins: [],
}
