/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // 所有 app 目录
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",  // ← 这是你实际页面/组件目录
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/booking-ui/src/**/*.{js,ts,jsx,tsx,mdx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

