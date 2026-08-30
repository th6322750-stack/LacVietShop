import type { Config } from "tailwindcss";

/**
 * Token nguồn: PROJECT_HANDOFF.md §6. Không tự chế giá trị ngoài danh sách này.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lv: {
          bg: "rgb(var(--lv-bg) / <alpha-value>)",
          surface: "rgb(var(--lv-surface) / <alpha-value>)",
          "surface-soft": "rgb(var(--lv-surface-soft) / <alpha-value>)",
          border: "rgb(var(--lv-border) / <alpha-value>)",
          "border-gold": "rgb(var(--lv-border-gold) / <alpha-value>)",
          navy: {
            950: "rgb(var(--lv-navy-950) / <alpha-value>)",
            900: "rgb(var(--lv-navy-900) / <alpha-value>)",
            700: "rgb(var(--lv-navy-700) / <alpha-value>)",
          },
          text: "rgb(var(--lv-text) / <alpha-value>)",
          muted: "rgb(var(--lv-muted) / <alpha-value>)",
          gold: {
            700: "rgb(var(--lv-gold-700) / <alpha-value>)",
            600: "rgb(var(--lv-gold-600) / <alpha-value>)",
            500: "rgb(var(--lv-gold-500) / <alpha-value>)",
            400: "rgb(var(--lv-gold-400) / <alpha-value>)",
            100: "rgb(var(--lv-gold-100) / <alpha-value>)",
            50: "rgb(var(--lv-gold-050) / <alpha-value>)",
          },
          success: "rgb(var(--lv-success) / <alpha-value>)",
          warning: "rgb(var(--lv-warning) / <alpha-value>)",
          danger: "rgb(var(--lv-danger) / <alpha-value>)",
          info: "rgb(var(--lv-info) / <alpha-value>)",
        },
      },
      borderRadius: {
        control: "10px",
        card: "14px",
        panel: "16px",
        pill: "999px",
      },
      fontSize: {
        // §6 typography scale — [size, {lineHeight, fontWeight}]
        h1: ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "h1-m": ["26px", { lineHeight: "34px", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "32px", fontWeight: "700" }],
        h3: ["18px", { lineHeight: "26px", fontWeight: "700" }],
        "card-title": ["15px", { lineHeight: "22px", fontWeight: "600" }],
        body: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-strong": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        label: ["13px", { lineHeight: "18px", fontWeight: "600" }],
        small: ["12px", { lineHeight: "18px", fontWeight: "400" }],
        "small-strong": ["12px", { lineHeight: "18px", fontWeight: "600" }],
        metric: ["24px", { lineHeight: "32px", fontWeight: "700" }],
        button: ["14px", { lineHeight: "20px", fontWeight: "600" }],
      },
      spacing: {
        gutter: "24px",
        "gutter-m": "16px",
        sidebar: "224px",
        rail: "80px",
        topbar: "72px",
      },
      maxWidth: {
        shell: "1560px",
      },
      screens: {
        sm: "576px",
        md: "768px",
        lg: "992px",
        xl: "1200px",
        "2xl": "1400px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 27, 61, 0.04), 0 1px 3px rgba(15, 27, 61, 0.06)",
        "card-hover": "0 6px 16px rgba(15, 27, 61, 0.08)",
        pop: "0 12px 32px rgba(15, 27, 61, 0.12)",
      },
      transitionDuration: {
        // §10 motion feel
        button: "140ms",
        card: "160ms",
        dropdown: "140ms",
        drawer: "220ms",
        modal: "180ms",
        progress: "300ms",
      },
      transitionTimingFunction: {
        drawer: "cubic-bezier(.2,.8,.2,1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "modal-in": {
          from: { opacity: "0", transform: "scale(.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 140ms ease-out",
        "modal-in": "modal-in 180ms ease-out",
        shimmer: "shimmer 1.4s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
