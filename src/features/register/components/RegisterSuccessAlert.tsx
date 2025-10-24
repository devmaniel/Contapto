import { CheckCircle2 } from "lucide-react"

interface RegisterSuccessAlertProps {
  countdown?: number
}

export const RegisterSuccessAlert = ({ countdown }: RegisterSuccessAlertProps) => {
  return (
    <div className="flex items-start gap-3 p-4 mb-4 border-l-4 border-green-500 bg-green-500/10 rounded-r-md">
      <div className="text-green-600 mt-0.5">
        <CheckCircle2 className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm text-green-600 mb-1">
          Registration Successful
        </p>
        <p className="text-sm text-muted-foreground">
          Your account has been created successfully. Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>
      </div>
    </div>
  )
}
