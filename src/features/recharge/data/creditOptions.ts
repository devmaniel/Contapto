export interface CreditOption {
  pesos: number
  credits: number
}

export const creditOptionsRow1: CreditOption[] = [
  { pesos: 100, credits: 100 },
  { pesos: 200, credits: 200 },
  { pesos: 300, credits: 300 },
]

export const creditOptionsRow2: CreditOption[] = [
  { pesos: 90, credits: 100 },
  { pesos: 80, credits: 100 },
  { pesos: 70, credits: 70 },
  { pesos: 50, credits: 50 },
]

export const creditOptionsRow3: CreditOption[] = [
  { pesos: 40, credits: 40 },
  { pesos: 40, credits: 40 },
  { pesos: 30, credits: 30 },
  { pesos: 20, credits: 100 },
]

export const creditOptionSmall: CreditOption = { pesos: 10, credits: 10 }
