import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from "unocss";

export default defineConfig({
  shortcuts: [
    ["flex-center", "flex items-center justify-center"],
    ["hstack", "flex items-center"],
    ["vstack", "flex flex-col justify-center"],
    ["border-c", "border-gray-200 dark:border-gray-600"],
    ["border-c-dark", "border-gray-300 dark:border-gray-500"],
    ["bg-c", "bg-softGray dark:bg-gray-700"],
    ["text-c", "text-gray-800 dark:text-gray-200"],
    ["text-c-light", "text-c opacity-85"],
    ["text-c-lighter", "text-c opacity-50"],
    ["text-c-dark", "text-black dark:text-white"],
    ["text-c-active", "text-brand dark:text-blue-300"],
    ["nav-item", "hstack space-x-1 text-c-light hover:text-c-dark"],
    [
      "btn",
      "hstack space-x-1 rounded transition-colors decoration-none text-sm !text-c bg-gray-100/90 dark:bg-gray-50/10 hover:(!bg-gray-500 !text-white !no-underline)"
    ],
    ["prose-lg", "lg:text-lg max-w-content"]
  ],
  theme: {
    fontFamily: {
      sans: `"Computer Modern Sans", system-ui, -apple-system, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif`
    },
    boxShadow: {
      nav: "0 1px 8px 0 rgba(27, 35, 47, .1)"
    },
    colors: {
      brand: "#1772d0",
      softGray: "#f1f0ea"
    },
    maxWidth: {
      content: "90ch"
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        display: "inline-block",
        "vertical-align": "sub"
      }
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        ui: "DM Sans:400,700"
      }
    })
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  safelist: "prose prose-lg m-auto text-left".split(" ")
});
