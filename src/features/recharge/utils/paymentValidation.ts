/**
 * Validates if the payment form is complete and valid
 */
export const validatePaymentForm = (
  cardNumber: string,
  cardholderName: string,
  expirationDate: string,
  securityCode: string
): boolean => {
  const cardNumberValid = cardNumber.replace(/\s/g, '').length >= 13
  const nameValid = cardholderName.trim().length > 0
  const expirationValid = /^\d{2}\/\d{2}$/.test(expirationDate)
  const cvvValid = securityCode.length >= 3
  
  return cardNumberValid && nameValid && expirationValid && cvvValid
}

/**
 * Simulates payment processing
 * @param delayMs - Delay in milliseconds (default: 2000ms)
 */
export const processPayment = async (delayMs: number = 2000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, delayMs))
}
