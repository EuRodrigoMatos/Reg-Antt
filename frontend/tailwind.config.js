/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        antt: {
          laranja: '#FF6B00',
          laranjaEscuro: '#CC5500'
        }
      }
    }
  },
  plugins: []
}
