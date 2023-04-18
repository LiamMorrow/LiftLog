/** @type {import('tailwindcss').Config} */
export const config = {
    content: ["./**/*.{razor,html,cshtml}"],
    theme: {
        borderRadius: {
            'card': '20px'
        },
        boxShadow: {
          'card': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
        },
        extend: {},
    },
    plugins: [],
}
