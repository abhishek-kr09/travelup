export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ["Plus Jakarta Sans", "sans-serif"]
      },
      colors: {
        primary: "#FF385C"
      },
      boxShadow: {
        glow: "0 0 25px rgba(255,56,92,0.4)"
      }
    },
  },
  plugins: [],
}

