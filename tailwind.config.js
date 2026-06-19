/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Nunito ≈ Duolingo's rounded "Feather"/"din-round" feel.
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        // Duolingo palette
        duo: {
          green: '#58cc02',
          greenDark: '#58a700', // button bottom-shadow
          greenHover: '#61e002',
          blue: '#1cb0f6',
          blueDark: '#1899d6',
          red: '#ff4b4b',
          redDark: '#ea2b2b',
          gold: '#ffc800',
          goldDark: '#e6a000',
          purple: '#ce82ff',
          ink: '#3c3c3c',
          gray: '#afafaf',
          line: '#e5e5e5',
          snow: '#f7f7f7',
          locked: '#e5e5e5',
        },
      },
      boxShadow: {
        'btn-green': '0 4px 0 #58a700',
        'btn-blue': '0 4px 0 #1899d6',
        'btn-red': '0 4px 0 #ea2b2b',
        'btn-gray': '0 4px 0 #e5e5e5',
        'btn-gold': '0 4px 0 #e6a000',
        node: '0 5px 0 rgba(0,0,0,0.12)',
        card: '0 2px 0 #e5e5e5',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bob: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        pop: 'pop 0.3s ease-out',
        bob: 'bob 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
