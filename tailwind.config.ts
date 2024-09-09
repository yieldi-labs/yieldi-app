import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "yieldi-gray": {
          200: "#DCD4C9",
        },
        "yieldi-brown": {
          DEFAULT: "#332B29",
          light: "#6D655D",
        },
        "yieldi-beige": "#F5F1EB",
        "yieldi-green": "#A1FD59",
      },
      spacing: {
        "1": "0.25rem", // 4px
        "1.5": "0.375rem", // 6px
        "2": "0.5rem", // 8px
        "3": "0.75rem", // 12px
        "4": "1rem", // 16px
        "6": "1.5rem", // 24px
        "14": "3.5rem", // 56px
      },
      fontSize: {
        xs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        base: "1rem", // 16px
        lg: "1.125rem", // 18px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.5rem", // 40px
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        bold: "700",
      },
      minWidth: {
        dialog: "552px",
      },
      maxWidth: {
        dialog: "552px",
      },
      padding: {
        "2px": "2px",
        "4px": "4px",
      },
    },
    fontFamily: {
      "gt-america": ["GT America Trial", "sans-serif"],
      "gt-america-mono": ["GT America Mono Trial", "monospace"],
      "gt-america-ext": ["GT America Extended Trial", "sans-serif"]
    },
  },
  plugins: [],
};

export default config;
