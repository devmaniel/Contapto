import type { RegisterError } from "@/features/auth/types"
import { getErrorIcon, getErrorTitle } from "../utils/errorHelpers"

interface RegisterErrorAlertProps {
  error: RegisterError
}

export const RegisterErrorAlert = ({ error }: RegisterErrorAlertProps) => {
  return (
    <div className="flex items-start gap-3 p-4 mb-4 border-l-4 border-destructive bg-destructive/10 rounded-r-md">
      <div className="text-destructive mt-0.5">
        {getErrorIcon(error.code)}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm text-destructive mb-1">
          {getErrorTitle(error.code)}
        </p>
        <p className="text-sm text-muted-foreground">
          {error.message}
        </p>
      </div>
    </div>
  )
}
