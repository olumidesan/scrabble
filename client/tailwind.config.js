module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      width: {
        '450': '450px'
      }
    },
    fontFamily: {
      'sans': ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      'display': ['Oswald'],
      'body': ['Roboto', '"Open Sans"'],
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
