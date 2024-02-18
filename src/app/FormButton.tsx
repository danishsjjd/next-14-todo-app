"use client"

import { useFormStatus } from "react-dom"

function FormButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="border disabled:bg-red-700 border-slate-300 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 focus-within:bg-slate-700 outline-none"
      disabled={pending || disabled}
    >
      Create
    </button>
  )
}

export default FormButton
