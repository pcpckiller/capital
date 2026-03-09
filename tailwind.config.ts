import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        electric: '#0070f3',
        neon: {
          purple: '#7c3aed'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,112,243,0.45), 0 0 30px rgba(0,112,243,0.18)',
        glowStrong:
          '0 0 0 1px rgba(0,112,243,0.65), 0 0 45px rgba(0,112,243,0.28), 0 0 90px rgba(124,58,237,0.12)'
      },
      backgroundImage: {
        'radial-glow':
          'radial-gradient(800px circle at 30% 10%, rgba(0,112,243,0.22), transparent 55%), radial-gradient(700px circle at 70% 30%, rgba(124,58,237,0.16), transparent 60%)',
        'grid-faint':
          'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
} satisfies Config;

