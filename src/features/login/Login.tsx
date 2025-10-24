import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { FieldDescription } from "@/shared/components/ui/field"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { useLogin } from "@/features/auth/hooks/useLogin"
import { LoginErrorAlert, LoginForm, LoginSuccessDialog } from "./components"
import { loginSchema, type LoginFormData } from "./types"
import backgroundImage from '@/assets/background/26987170_v904-nunny-012-l.jpg'
import ContaptoTextLogo  from "../../assets/contapto-text.svg"

const Login = () => {
  const navigate = useNavigate()
  const { login, loading, error } = useLogin()
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const {
    register: registerField,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const result = await login({
      phone: values.phone,
      password: values.password,
    })

    if (result) {
      // Redirect to chats immediately after successful login
      navigate({ to: '/chats' })
    }
  })

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen max-w-md mx-auto px-4">
        {/* Brand Name */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white tracking-tight">Contapto</h1>
        </div>

        <div className={cn("flex flex-col gap-6 w-full")}> 
          <Card>
            <CardHeader className="text-left">
              <img src={ContaptoTextLogo} alt="contapto-img" className="h-5 text-white" />
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Login with your account
              </CardDescription>
            </CardHeader>
           
            <CardContent>
              {error && <LoginErrorAlert error={error} />}
              <LoginForm
                control={control}
                errors={errors}
                registerField={registerField}
                onSubmit={onSubmit}
                loading={loading}
              />
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center text-white">
            By clicking continue, you agree to our <a href="#" className="underline">Terms of Service</a>{" "}
            and <a href="#" className="underline">Privacy Policy</a>.
          </FieldDescription>
        </div>

        <LoginSuccessDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
        />
      </div>
    </div>
  )
}

export default Login