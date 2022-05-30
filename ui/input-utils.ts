import { FieldError, FieldErrors, Path, UseFormRegister } from "react-hook-form";
import { RegisterOptions } from "react-hook-form/dist/types/validator";

export const RECAPTCHA_CONTAINER = "recaptcha-container";

type Options<T> = RegisterOptions<T> & { type?: string, regex?: RegExp }

export function registerText<T>(key: Path<T>,
                                register: UseFormRegister<T>,
                                errors: FieldErrors<FieldErrors>,
                                options?: Options<T>) {
  const { regex, type, required } = options || {};
  const labelKey = `forms:label-${key}`;
  return {
    type: type || "text",
    labelKey,
    required: !!required,
    errorKey: (errors[key] as FieldError)?.message,
    ...register(key, {
      ...options,
      required: !!required ? "forms:error-required" : false,
      pattern: !!regex ? {
        value: regex,
        message: "forms:error"
      } : undefined
    })
  };
}

export function registerPhone<T>(key: Path<T>,
                                 register: UseFormRegister<T>,
                                 errors: FieldErrors<T>,
                                 options?: Options<T>) {
  return registerText(key, register, errors, {
    ...(options || {}),
    type: "tel",
    regex: /^(\+84|84|0)+([0-9]{9})$/
  });
}

export function registerEmail<T>(key: Path<T>,
                                 register: UseFormRegister<T>,
                                 errors: FieldErrors<T>,
                                 options?: Options<T>) {
  return registerText(key, register, errors, {
    ...options,
    type: "email",
    regex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  });
}

export function toInternationalPhone(phone: string) {
  if (phone) {
    const fixed = phone.replace(/\s/g, "");
    if (fixed.startsWith("+84")) {
      return fixed.charAt(3) === "0" ? "+84" + fixed.substr(4) : fixed;
    }
    return "+84" + remove0(fixed);
  }
  return "";
}

function remove0(phone: string) {
  return phone.charAt(0) === "0" ? phone.substr(1) : phone;
}

export function toLocalPhone(phone: string) {
  return phone.startsWith("+84") ? phone.substr(3) : phone;
}
