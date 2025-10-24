import { z } from "zod"
import { phoneSchema } from "@/features/auth/utils/validation"

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Password is required"),
})

export type LoginFormData = z.infer<typeof loginSchema>
