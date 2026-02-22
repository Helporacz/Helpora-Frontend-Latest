/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  prefix: "tw-",
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#22bf1e",
          mint: "#00ffc8",
          dark: "#0b132b",
        },
      },
    },
  },
  plugins: [],
};
