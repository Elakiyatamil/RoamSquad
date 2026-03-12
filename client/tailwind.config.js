/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                red: "#C8391A",
                gold: "#C4973A",
                ink: "#1C1410",
                cream: "#FAF6EF",
                forest: "#2A4A38",
                ocean: "#2E6F95",
            },
            fontFamily: {
                display: ["Cormorant Garamond", "serif"],
                sans: ["DM Sans", "sans-serif"],
            },
        },
    },
    plugins: [],
}
