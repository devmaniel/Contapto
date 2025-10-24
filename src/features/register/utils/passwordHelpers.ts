export interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "One lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "One number",
    test: (password) => /\d/.test(password),
  },
  {
    label: "One special character",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
]

export const checkPasswordRequirements = (password: string): boolean => {
  return passwordRequirements.every((requirement) => requirement.test(password))
}
