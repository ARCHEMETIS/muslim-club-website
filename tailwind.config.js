/** ตั้งค่า Tailwind สำหรับ build เป็นไฟล์ CSS ในเว็บเอง (ไม่พึ่ง CDN)
 *  สร้างไฟล์: npx tailwindcss@3 -c tailwind.config.js -i css/tailwind-input.css -o css/tailwind.css --minify
 */
module.exports = {
  content: ['./index.html', './team.html', './js/**/*.js'],
  // คลาสที่ JS ต่อจากตัวแปร (Tailwind สแกนไม่เจอ) → ใส่ไว้ให้ชัวร์
  safelist: ['text-green-700', 'text-gold-dark', 'text-green-600', 'text-green-800'],
  theme: {
    extend: {
      colors: {
        green: { 50:'#f1f7f1', 600:'#2E7D32', 700:'#236026', 800:'#1B5E20', 900:'#14532D', 950:'#0d3b1d' },
        cream: '#FDFCF0',
        sand:  '#F5F1E3',
        gold:  { DEFAULT:'#C0A062', light:'#D8BF8A', dark:'#A6864A' },
      },
      fontFamily: {
        kanit:   ['Kanit','sans-serif'],
        sarabun: ['Sarabun','sans-serif'],
        amiri:   ['Amiri','serif'],
      },
    },
  },
};
