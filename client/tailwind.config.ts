module.exports = {
  theme: {
    extend: {
      keyframes: {
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }, // Adjust based on overflow
        },
      },
      animation: {
        "scroll-left": "scroll-left 5s linear infinite",
      },
    },
  },
};
