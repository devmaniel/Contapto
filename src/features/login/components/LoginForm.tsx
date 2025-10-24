import { Button } from "@/shared/components/ui/button"
import { Loader } from "lucide-react"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { PhoneInput } from "@/features/register/components/PhoneInput"
import { Link } from "@tanstack/react-router"
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form"
import type { LoginFormData } from "../types"

interface LoginFormProps {
  control: Control<LoginFormData>
  errors: FieldErrors<LoginFormData>
  registerField: UseFormRegister<LoginFormData>
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  loading: boolean
}

export const LoginForm = ({
  control,
  errors,
  registerField,
  onSubmit,
  loading,
}: LoginFormProps) => {
  return (
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
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            {...registerField("password")}
          />
          {errors.password && (
            <FieldDescription className="text-destructive">
              {errors.password.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <Button type="submit" disabled={loading} className="rounded-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader className="animate-spin" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="underline-offset-4 hover:underline">
              Go to Register
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
