"use client"
import { createTodo } from "@/actions/todo"
import { Todo } from "@prisma/client"
import { useOptimistic, useRef } from "react"
import { useFormState } from "react-dom"
import Form from "./Form"
import TodoList from "./TodoList"

const initialState = {
  message: "",
}

const Todos = ({ todos }: { todos: Todo[] }) => {
  const formRef = useRef<HTMLFormElement>(null)
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  )

  const [{ message }, action] = useFormState(
    async (data: typeof initialState, formData: FormData) => {
      setOptimisticTodos({
        complete: false,
        createdAt: new Date(),
        id: crypto.randomUUID(),
        title: formData.get("title")?.toString() || "",
        updatedAt: new Date(),
      })
      const check = await createTodo(data, formData)
      if (!check.message) formRef.current?.reset()
      return check
    },
    initialState
  )

  return (
    <>
      <Form action={action} formRef={formRef} message={message} ref={formRef} />
      <TodoList todos={optimisticTodos} />
    </>
  )
}

export default Todos
