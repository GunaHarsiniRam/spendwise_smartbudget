/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: { 50:'#EEF2FF', 100:'#E0E7FF', 500:'#6366F1', 600:'#4F46E5', 700:'#4338CA', 800:'#3730A3' },
        emerald:{ 50:'#ECFDF5', 100:'#D1FAE5', 500:'#10B981', 600:'#059669', 700:'#047857' },
        slate:  { 50:'#F8FAFC', 100:'#F1F5F9', 200:'#E2E8F0', 300:'#CBD5E1', 400:'#94A3B8', 500:'#64748B', 600:'#475569', 700:'#334155', 800:'#1E293B', 900:'#0F172A' },
        red:    { 50:'#FEF2F2', 100:'#FEE2E2', 500:'#EF4444', 600:'#DC2626' },
        amber:  { 50:'#FFFBEB', 100:'#FEF3C7', 500:'#F59E0B', 600:'#D97706' },
        blue:   { 50:'#EFF6FF', 100:'#DBEAFE', 500:'#3B82F6', 600:'#2563EB' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md':'0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'card-lg':'0 10px 28px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)',
        'focus':  '0 0 0 3px rgba(79,70,229,0.12)',
      },
      borderRadius: {
        DEFAULT: '8px',
        'lg':    '12px',
        'xl':    '16px',
        '2xl':   '20px',
      },
    },
  },
  plugins: [],
}
