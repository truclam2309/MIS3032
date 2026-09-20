export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#f5f6f8',
        surface: '#ffffff',
        raised: '#fbfcfd',
        ink: {
          DEFAULT: '#12161c',
          muted: '#5a6472',
          subtle: '#8a929e',
          invert: '#ffffff',
        },
        line: {
          DEFAULT: '#e4e7ec',
          strong: '#cdd2da',
        },
        brand: {
          50: '#eef1ff',
          100: '#dfe4ff',
          200: '#c3ccff',
          500: '#4a56d2',
          600: '#3b45ad',
          700: '#2f3789',
        },
        ok: {
          50: '#e9f7ef',
          200: '#b6e2c7',
          600: '#1e7a4c',
          700: '#16603b',
        },
        warn: {
          50: '#fdf4e3',
          200: '#f2ddad',
          600: '#96650b',
          700: '#7a5209',
        },
        danger: {
          50: '#fdecec',
          200: '#f4c2c2',
          600: '#b32626',
          700: '#8e1e1e',
        },
        info: {
          50: '#eaf3fb',
          200: '#bcd8ef',
          600: '#1f6394',
          700: '#184e75',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 22, 28, 0.04), 0 1px 1px rgba(18, 22, 28, 0.03)',
        pop: '0 8px 24px rgba(18, 22, 28, 0.10)',
      },
      transitionTimingFunction: {
        exp: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
}
