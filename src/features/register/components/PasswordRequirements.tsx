import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { passwordRequirements } from "../utils/passwordHelpers"

interface PasswordRequirementsProps {
  password: string
}

export const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  return (
    <div className="space-y-2 p-3 bg-muted/50 rounded-md animate-in fade-in slide-in-from-top-2 duration-300">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Password must contain:
      </p>
      <div className="space-y-1.5">
        {passwordRequirements.map((requirement, index) => {
          const isMet = requirement.test(password)
          return (
            <div key={index} className="flex items-center gap-2 transition-all duration-200">
              <div
                className={cn(
                  "flex items-center justify-center w-4 h-4 rounded-full transition-all duration-200",
                  isMet
                    ? "bg-green-500 text-white"
                    : "bg-muted-foreground/20 text-muted-foreground"
                )}
              >
                {isMet ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs transition-all duration-200",
                  isMet ? "text-green-600 font-medium" : "text-muted-foreground"
                )}
              >
                {requirement.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
