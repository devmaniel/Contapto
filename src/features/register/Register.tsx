import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Loader } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { useRegister } from "@/features/auth/hooks/useRegister"
import type { RegisterRequest } from "@/features/auth/types"
import { registerSchema } from "@/features/auth/utils/validation"
import { RegisterErrorAlert, PhoneInput, PasswordRequirements } from "./components"
import { checkPasswordRequirements } from "./utils/passwordHelpers"
import backgroundImage from '@/assets/background/26987170_v904-nunny-012-l.jpg'
import  ContaptoTextLogo  from "../../assets/contapto-text.svg"

const Register = () => {
  const navigate = useNavigate()
  const { register: submitRegister, loading, error, data } = useRegister()
  const [showSuccess, setShowSuccess] = useState(false)
  const [countdown, setCountdown] = useState(7)

  const {
    register: registerField,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  })

  const password = watch("password")
  const isPasswordValid = checkPasswordRequirements(password)

  useEffect(() => {
    if (data) {
      setShowSuccess(true)
      setCountdown(7)
      
      // Countdown interval
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      // Redirect to login after 7 seconds
      const timer = setTimeout(() => {
        navigate({ to: '/login' })
      }, 7000)
      
      return () => {
        clearTimeout(timer)
        clearInterval(countdownInterval)
      }
    }
  }, [data, navigate])

  const onSubmit = handleSubmit(async (values) => {
    // Add minimum 3-second delay for better UX
    const [result] = await Promise.all([
      submitRegister(values),
      new Promise(resolve => setTimeout(resolve, 3000))
    ])
    console.log(result)
    return result
  })

  // Show success UI - completely separate from form
  if (showSuccess && data) {
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
          

          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl text-green-600">Registration Successful! 🎉</CardTitle>
              <CardDescription className="text-base mt-2">
                Your account has been created successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-sm text-gray-700 mb-2">
                  Redirecting to login in
                </p>
                <p className="text-4xl font-bold text-green-600">
                  {countdown}
                </p>
                <p className="text-xs text-gray-500 mt-1">seconds</p>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => navigate({ to: '/login' })}
                  className="w-full rounded-full"
                  size="lg"
                >
                  Go to Login Now
                </Button>
                
                <p className="text-xs text-center text-gray-500">
                  You can now sign in with your credentials
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show registration form
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
          
        </div>

        <div className={cn("flex flex-col gap-6 w-full")}> 
          <Card>
            <CardHeader className="text-left">
              <img src={ContaptoTextLogo} alt="contapto-img" className="h-5 text-white" />
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>
                Register with your phone number and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && <RegisterErrorAlert error={error} />}
              <form onSubmit={onSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          id="phone"
                          required
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      )}
                    />
                    {errors.phone && (
                      <FieldDescription className="text-destructive">
                        {errors.phone.message}
                      </FieldDescription> 
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      required
                      {...registerField("password")}
                    />
                    <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ maxHeight: password ? '300px' : '0' }}>
                      {password && <PasswordRequirements password={password} />}
                    </div>
                    {errors.password && (
                      <FieldDescription className="text-destructive">
                        {errors.password.message}
                      </FieldDescription>
                    )}
                  </Field>
                  <Field>
                    <Button type="submit" disabled={loading || !isPasswordValid} className="rounded-full">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader className="animate-spin" />
                          Registering...
                        </span>
                      ) : (
                        "Register"
                      )}
                    </Button>
                    <FieldDescription className="text-center">
                      Already have an account? <Link to="/login" className="underline-offset-4 hover:underline">Go to Login</Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center text-white">
            By clicking continue, you agree to our <a href="#" className="underline">Terms of Service</a>{" "}
            and <a href="#" className="underline">Privacy Policy</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  )
}

export default Register