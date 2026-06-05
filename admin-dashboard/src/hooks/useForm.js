import { useCallback, useState } from 'react'
import { showError } from './helpers'

/**
 * Custom hook for form state management
 */
export function useForm(initialValues = {}, onSubmit = null) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setFieldValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const setFieldError = useCallback((field, error) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }, [])

  const setFieldTouched = useCallback((field, touched = true) => {
    setTouched((prev) => ({ ...prev, [field]: touched }))
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setFieldValue(name, type === 'checkbox' ? checked : value)
  }, [setFieldValue])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setFieldTouched(name)
  }, [setFieldTouched])

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault()
      if (onSubmit) {
        setIsSubmitting(true)
        try {
          await onSubmit(values)
        } catch (error) {
          showError(error.message || 'An error occurred')
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [values, onSubmit]
  )

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  }
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Validate form fields
 */
export function validateForm(values, schema) {
  const errors = {}

  for (const field in schema) {
    const rules = schema[field]
    const value = values[field]

    if (rules.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`
      continue
    }

    if (rules.email && value && !validateEmail(value)) {
      errors[field] = 'Invalid email address'
      continue
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`
      continue
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors[field] = `${field} must be no more than ${rules.maxLength} characters`
      continue
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors[field] = rules.message || `${field} format is invalid`
      continue
    }
  }

  return errors
}

/**
 * Custom hook for form validation
 */
export function useFormValidation(initialValues, validationSchema) {
  const form = useForm(initialValues, async (values) => {
    const errors = validateForm(values, validationSchema)
    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach((field) => {
        form.setFieldError(field, errors[field])
      })
      return
    }
  })

  return form
}
