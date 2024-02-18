"use client"

import { FormEvent, RefObject, forwardRef } from "react"
import FormButton from "./FormButton"

const Form = forwardRef<
  HTMLFormElement,
  {
    action: (formData: FormData) => unknown
    formRef: RefObject<HTMLFormElement>
    disabled?: boolean
    onSubmit?: (e: FormEvent<HTMLFormElement>) => unknown
  }
>(({ action, formRef, disabled, onSubmit }, ref) => {
  return (
    <form
      ref={ref}
      action={action}
      onSubmit={onSubmit}
      className="flex gap-2 flex-col"
    >
      <input
        type="text"
        name="title"
        className="border border-slate-300 bg-transparent rounded px-2 py-1 outline-none focus-within:border-slate-100"
      />
      <div className="flex gap-1 justify-end">
        <FormButton disabled={disabled} />
        <button
          className="border border-slate-300 disabled:bg-gray-700 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 outline-none"
          onClick={() => formRef.current?.reset()}
          type="button"
          disabled={disabled}
        >
          Cancel
        </button>
      </div>
    </form>
  )
})

Form.displayName = "Form"

export default Form
