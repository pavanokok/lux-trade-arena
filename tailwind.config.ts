
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
					foreground: 'hsl(var(--primary-foreground))'
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
				// Custom colors for our trading platform
				navy: {
					DEFAULT: '#0F172A',
					50: '#F8FAFC',
					100: '#F1F5F9',
					200: '#E2E8F0',
					300: '#CBD5E1',
					400: '#94A3B8',
					500: '#64748B',
					600: '#475569',
					700: '#334155',
					800: '#1E293B',
					900: '#0F172A',
					950: '#020617',
				},
				teal: {
					DEFAULT: '#0D9488',
					50: '#F0FDFA',
					100: '#CCFBF1',
					200: '#99F6E4',
					300: '#5EEAD4',
					400: '#2DD4BF',
					500: '#14B8A6',
					600: '#0D9488',
					700: '#0F766E',
					800: '#115E59',
					900: '#134E4A',
					950: '#022C22',
				},
				gold: {
					DEFAULT: '#EAB308',
					50: '#FEFCE8',
					100: '#FEF9C3',
					200: '#FEF08A',
					300: '#FDE047',
					400: '#FACC15',
					500: '#EAB308',
					600: '#CA8A04',
					700: '#A16207',
					800: '#854D0E',
					900: '#713F12',
					950: '#422006',
				},
				success: {
					DEFAULT: '#10B981',
					50: '#ECFDF5',
					100: '#D1FAE5',
					200: '#A7F3D0',
					300: '#6EE7B7',
					400: '#34D399',
					500: '#10B981',
					600: '#059669',
					700: '#047857',
					800: '#065F46',
					900: '#064E3B',
					950: '#022C22',
				},
				danger: {
					DEFAULT: '#EF4444',
					50: '#FEF2F2',
					100: '#FEE2E2',
					200: '#FECACA',
					300: '#FCA5A5',
					400: '#F87171',
					500: '#EF4444',
					600: '#DC2626',
					700: '#B91C1C',
					800: '#991B1B',
					900: '#7F1D1D',
					950: '#450A0A',
				},
				chart: {
					bg: 'rgba(15, 23, 42, 0.6)',
					grid: 'rgba(148, 163, 184, 0.1)',
					tooltip: 'rgba(15, 23, 42, 0.8)',
				}
			},
			fontFamily: {
				sans: ['"Inter"', 'sans-serif'],
				mono: ['"JetBrains Mono"', 'monospace'],
				display: ['"Clash Display"', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"pulse-subtle": {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.8" },
				},
				"fade-in": {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				"fade-out": {
					from: { opacity: "1" },
					to: { opacity: "0" },
				},
				"slide-up": {
					from: { transform: "translateY(10px)", opacity: "0" },
					to: { transform: "translateY(0)", opacity: "1" },
				},
				"slide-down": {
					from: { transform: "translateY(-10px)", opacity: "0" },
					to: { transform: "translateY(0)", opacity: "1" },
				},
				"zoom-in": {
					from: { transform: "scale(0.95)", opacity: "0" },
					to: { transform: "scale(1)", opacity: "1" },
				},
				"spin-slow": {
					from: { transform: "rotate(0deg)" },
					to: { transform: "rotate(360deg)" },
				},
				ticker: {
					"0%": { transform: "translateX(0)" },
					"100%": { transform: "translateX(-100%)" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				"fade-in": "fade-in 0.3s ease-out",
				"fade-out": "fade-out 0.2s ease-in",
				"slide-up": "slide-up 0.3s ease-out",
				"slide-down": "slide-down 0.3s ease-out",
				"zoom-in": "zoom-in 0.2s ease-out",
				"spin-slow": "spin-slow 3s linear infinite",
				ticker: "ticker 40s linear infinite",
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
				'hero-pattern': "url('/hero-pattern.svg')",
				'noise': "url('/noise.svg')",
			},
			boxShadow: {
				'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
				'glow-gold': '0 0 20px rgba(234, 179, 8, 0.3)',
				'glass': '0 4px 24px 0 rgba(0, 0, 0, 0.05)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
