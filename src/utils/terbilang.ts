export function spellNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '-';
  
  const digits = ['Nol', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
  const nStr = String(num);
  
  return nStr
    .split('')
    .map(digit => {
      const d = parseInt(digit);
      return isNaN(d) ? digit : digits[d];
    })
    .join(' ');
}
