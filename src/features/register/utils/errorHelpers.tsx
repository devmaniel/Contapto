import { 
  AlertCircle, 
  UserX, 
  WifiOff, 
  ServerCrash, 
  ShieldAlert,
  Clock
} from "lucide-react"

export const getErrorIcon = (errorCode?: string) => {
  switch (errorCode) {
    case "user_already_exists":
      return <UserX className="h-5 w-5" />
    case "phone_already_registered":
      return <ShieldAlert className="h-5 w-5" />
    case "network_error":
      return <WifiOff className="h-5 w-5" />
    case "server_error":
      return <ServerCrash className="h-5 w-5" />
    case "rate_limit":
      return <Clock className="h-5 w-5" />
    default:
      return <AlertCircle className="h-5 w-5" />
  }
}

export const getErrorTitle = (errorCode?: string) => {
  switch (errorCode) {
    case "user_already_exists":
      return "Account Already Exists"
    case "phone_already_registered":
      return "Phone Number Already Registered"
    case "network_error":
      return "Connection Error"
    case "server_error":
      return "Server Error"
    case "rate_limit":
      return "Too Many Attempts"
    default:
      return "Registration Failed"
  }
}
