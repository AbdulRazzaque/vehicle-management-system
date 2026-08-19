'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type FormProps<T> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: T | null
}

export function useFormReset<T>(open: boolean, initial: () => T, initialData?: T | null) {
  const [form, setForm] = useState<T>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm(initialData)
      } else {
        setForm(initial())
      }
      setErrors({})
      setIsSubmitting(false)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  return { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting }
}

export function SelectField({
  id,
  value,
  onValueChange,
  placeholder,
  options,
  className,
}: {
  id: string
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: (string | { value: string; label: string })[]
  className?: string
}) {
  // Normalize all options to { value, label } objects so Base UI can map
  // the selected value back to its label in the trigger via the `items` prop.
  const items = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )

  return (
    <Select value={value || undefined} onValueChange={onValueChange} items={items}>
      <SelectTrigger id={id} className={className ?? 'w-full'}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

