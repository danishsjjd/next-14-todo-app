"use client"
import { createTodo } from "@/actions/todo"
import { Todo } from "@prisma/client"
import Link from "next/link"
import { useFormState, useFormStatus } from "react-dom"
import TodoList from "./TodoList"
import { useOptimistic } from "react"

const initialState = {
  message: "",
}

const Form = ({ todos }: { todos: Todo[] }) => {
  const [form, action] = useFormState(createTodo, initialState)
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  )

  return (
    <>
      <form
        action={async (formData) => {
          setOptimisticTodos({
            complete: false,
            createdAt: new Date(),
            id: crypto.randomUUID(),
            title: formData.get("title")?.toString() || "",
            updatedAt: new Date(),
          })
          action(formData)
        }}
        className="flex gap-2 flex-col"
      >
        <input
          type="text"
          name="title"
          className="border border-slate-300 bg-transparent rounded px-2 py-1 outline-none focus-within:border-slate-100"
        />
        <div className="flex gap-1 justify-end">
          <Button />
          <Link
            href=".."
            className="border border-slate-300 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 focus-within:bg-slate-700 outline-none"
          >
            Cancel
          </Link>
        </div>
        {form.message && <span className="text-red-400">{form.message}</span>}
      </form>
      <TodoList todos={optimisticTodos} />
    </>
  )
}

function Button() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="border disabled:bg-red-700 border-slate-300 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 focus-within:bg-slate-700 outline-none"
      disabled={pending}
    >
      Create
    </button>
  )
}

export default Form
