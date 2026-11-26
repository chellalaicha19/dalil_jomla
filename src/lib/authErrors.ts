export function authErrorMessage(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
  if (m.includes('already registered')) return 'هذا البريد الإلكتروني مسجل مسبقاً'
  if (m.includes('password')) return 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل'
  if (m.includes('rate limit')) return 'محاولات كثيرة، حاول مرة أخرى بعد قليل'
  return 'حدث خطأ، حاول مرة أخرى'
}