import type { Config } from 'tailwindcss'

/** @type {import('tailwindcss').Config} */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Our colors start
        darkColor: "#151515",
        lightColor: "#52525b",
        lightOrange: "#fca99b",
        lightBlue: "#7688DB",
        darkBlue: "#6c7fd8",
        darkText: "#686e7d",
        lightBg: "#F8F8FB",
        // Our colors end
      }
    },
  },
  plugins: [],
}

export default config
