import { z } from "zod"

const phoneRegex = /^\+63\d{9,10}$/
const upperRegex = /[A-Z]/
const lowerRegex = /[a-z]/
const digitRegex = /\d/
const symbolRegex = /[^A-Za-z0-9]/

export const phoneSchema = z
  .string()
  .trim()
  .min(8, "Phone number is too short")
  .max(16, "Phone number is too long")
  .regex(phoneRegex, "Enter a valid phone number")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((value) => upperRegex.test(value), "Include at least one uppercase letter")
  .refine((value) => lowerRegex.test(value), "Include at least one lowercase letter")
  .refine((value) => digitRegex.test(value), "Include at least one number")
  .refine((value) => symbolRegex.test(value), "Include at least one special character")

export const registerSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
})

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Password is required"),
})

export function validatePhone(phone: string) {
  return phoneSchema.safeParse(phone)
}

export function validatePassword(password: string) {
  return passwordSchema.safeParse(password)
}

export function validateRegister(values: z.infer<typeof registerSchema>) {
  return registerSchema.safeParse(values)
}

export function validateLogin(values: z.infer<typeof loginSchema>) {
  return loginSchema.safeParse(values)
}
