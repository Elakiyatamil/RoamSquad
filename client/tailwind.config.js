/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                red: {
                    DEFAULT: '#C8391A',
                },
                gold: {
                    DEFAULT: '#C4973A',
                },
                ink: {
                    DEFAULT: '#1C1410',
                },
                cream: {
                    DEFAULT: '#FAF6EF',
                },
                forest: {
                    DEFAULT: '#2A4A38',
                },
            },
            fontFamily: {
                display: ['"Cormorant Garamond"', 'serif'],
                sans: ['"DM Sans"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
