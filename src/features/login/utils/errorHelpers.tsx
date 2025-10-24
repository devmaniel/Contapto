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
    case "user_not_found":
      return <UserX className="h-5 w-5" />
    case "invalid_credentials":
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
    case "user_not_found":
      return "Account Not Found"
    case "invalid_credentials":
      return "Invalid Credentials"
    case "network_error":
      return "Connection Error"
    case "server_error":
      return "Server Error"
    case "rate_limit":
      return "Too Many Attempts"
    default:
      return "Login Failed"
  }
}
