/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          orange: "#F39B64",
          orangeSoft: "#FFE4CF",
          cream: "#FBF6EE",
          green: "#DCEFD9",
          blue: "#DCEEFF",
          ink: "#4B433A",
          muted: "#8D847B",
          line: "#E9DED2",
          white: "#FFFDF9",
        },
      },
      boxShadow: {
        card: "0 16px 32px rgba(166, 131, 97, 0.12)",
      },
      fontFamily: {
        sans: ["'Noto Sans SC'", "'PingFang SC'", "'Microsoft YaHei'", "sans-serif"],
      },
      backgroundImage: {
        hero:
          "radial-gradient(circle at top left, rgba(243,155,100,0.28), transparent 38%), radial-gradient(circle at top right, rgba(220,239,217,0.75), transparent 32%), linear-gradient(180deg, #FFF7EF 0%, #FBF6EE 100%)",
      },
    },
  },
  plugins: [],
};
