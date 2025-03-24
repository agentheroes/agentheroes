import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        btn: "0px 2px 2px 0px #FBB072 inset, 0px -2px 2px 0px #9C4600 inset, 0px 7px 5.8px -6px rgba(0, 0, 0, 0.40)",
        red: "0px 2px 2px 0px #e80000 inset, 0px -2px 2px 0px #910000 inset, 0px 7px 5.8px -6px rgba(0, 0, 0, 0.40)",
        black: "0px 2px 2px 0px #000000 inset, 0px -2px 2px 0px #171717 inset, 0px 7px 5.8px -6px rgba(0, 0, 0, 0.40)",
        green: "0px 2px 2px 0px #0dff00 inset, 0px -2px 2px 0px #088501 inset, 0px 7px 5.8px -6px rgba(0, 0, 0, 0.40)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
