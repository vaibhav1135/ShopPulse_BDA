/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkbg: "#0B0F19",
        cardbg: "#111827",
        glassbg: "rgba(17, 24, 39, 0.75)",
        primary: "#3B82F6",
        accent: "#8B5CF6",
        emerald: "#10B981"
      }
    },
  },
  plugins: [],
}
