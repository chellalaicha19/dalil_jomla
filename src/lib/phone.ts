// Converts Arabic digits, removes spaces, turns +213 into 0
export function normalizePhone(input: string): string {
  const digits = input
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s\-.]/g, '')
  return digits.startsWith('+213') ? '0' + digits.slice(4)
       : digits.startsWith('00213') ? '0' + digits.slice(5)
       : digits
}

// Algerian mobile: 05, 06 or 07 followed by 8 digits
export function isValidMobile(phone: string): boolean {
  return /^0[567]\d{8}$/.test(phone)
}