"use client"

import { RefObject, forwardRef } from "react"
import FormButton from "./FormButton"

const Form = forwardRef<
  HTMLFormElement,
  {
    action: (formData: FormData) => unknown
    message: string
    formRef: RefObject<HTMLFormElement>
  }
>(({ action, message, formRef }, ref) => {
  return (
    <form ref={ref} action={action} className="flex gap-2 flex-col">
      <input
        type="text"
        name="title"
        className="border border-slate-300 bg-transparent rounded px-2 py-1 outline-none focus-within:border-slate-100"
      />
      <div className="flex gap-1 justify-end">
        <FormButton />
        <button
          className="border border-slate-300 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 focus-within:bg-slate-700 outline-none"
          onClick={() => formRef.current?.reset()}
          type="button"
        >
          Cancel
        </button>
      </div>
      {message && <span className="text-red-400">{message}</span>}
    </form>
  )
})

Form.displayName = "Form"

export default Form
