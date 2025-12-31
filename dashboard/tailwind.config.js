/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    900: '#0f172a', // Deep navy background
                    800: '#1e293b', // Card background
                    700: '#334155', // Border
                },
                accent: {
                    500: '#14b8a6', // Teal primary
                    400: '#2dd4bf', // Teal hover
                    glow: 'rgba(20, 184, 166, 0.5)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'pulse-glow': 'pulseGlow 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(20, 184, 166, 0.2)' },
                    '50%': { boxShadow: '0 0 20px rgba(20, 184, 166, 0.6)' },
                }
            }
        },
    },
    plugins: [],
}
