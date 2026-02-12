// tailwind.config.js
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))',
    				glow: 'hsl(var(--primary-glow))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
    			'apple-blue': '#007AFF',
    			'apple-gray': '#F2F2F7',
    			'apple-gray-dark': '#1C1C1E',
    			'palestine-green': '#006633',
    			'palestine-red': '#CC0000',
    			'palestine-black': '#000000',
          'golden': 'hsl(var(--primary))',
          'golden-glow': 'hsl(var(--primary-glow))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		fontFamily: {
    			arabic: [
    				'Noto Sans Arabic',
    				'Cairo',
    				'Tajawal',
    				'system-ui',
    				'sans-serif'
    			],
    			'sf-pro': [
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'SF Pro Text',
    				'SF Pro Icons',
    				'Helvetica Neue',
    				'Helvetica',
    				'Arial',
    				'sans-serif'
    			]
    		},
    		backgroundImage: {
    			'apple-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    			'palestine-gradient': 'linear-gradient(135deg, #006633 0%, #CC0000 50%, #000000 100%)',
    			'hero-gradient': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    		},
    		keyframes: {
                'fade-in-down': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(-20px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
                'fade-in-up': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(20px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
    			'scale-in': {
    				'0%': {
    					transform: 'scale(0.95)',
    					opacity: '0'
    				},
    				'100%': {
    					transform: 'scale(1)',
    					opacity: '1'
    				}
    			},
    			'slide-up': {
    				'0%': {
    					transform: 'translateY(100%)'
    				},
    				'100%': {
    					transform: 'translateY(0)'
    				}
    			},
    			float: {
    				'0%, 100%': {
    					transform: 'translateY(0px)'
    				},
    				'50%': {
    					transform: 'translateY(-5px)'
    				}
    			},
                'glow': {
                    '0%, 100%': { 'box-shadow': '0 0 8px hsl(var(--primary-glow))' },
                    '50%': { 'box-shadow': '0 0 24px hsl(var(--primary-glow))' }
                },
                'subtle-pulse': {
                    '0%, 100%': { opacity: '0.7' },
                    '50%': { opacity: '1' }
                },
                'radar': {
                    '0%': { transform: 'scale(0.5)', opacity: '0' },
                    '50%': { opacity: '0.3' },
                    '100%': { transform: 'scale(1.5)', opacity: '0' }
                }
    		},
    		animation: {
                'fade-in-down': 'fade-in-down 0.8s ease-out forwards',
                'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
    			'scale-in': 'scale-in 0.3s ease-out',
    			'slide-up': 'slide-up 0.4s ease-out',
    			'float': 'float 4s ease-in-out infinite',
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
                'glow': 'glow 3s ease-in-out infinite',
                'subtle-pulse': 'subtle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'radar': 'radar 2s ease-out infinite'
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
