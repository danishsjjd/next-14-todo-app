"use client"
import { createTodo } from "@/actions/todo"
import { Todo } from "@prisma/client"
import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react"
import Form from "./Form"
import { toggleTodo } from "@/actions/todo"

type TodoAction = { pending: boolean } & (
  | {
      type: "toggle"
      payload: { id: string }
    }
  | { type: "add"; payload: Todo }
)

const Todos = ({ todos }: { todos: Todo[] }) => {
    const formRef = useRef<HTMLFormElement>(null)
    const [state, setOptimisticTodos] = useOptimistic(
      { todos, pending: false },
      (state, newState: TodoAction) => {
        if (newState.type === "add")
          return {
            pending: newState.pending,
            todos: [...state.todos, newState.payload],
          }
        return {
          pending: newState.pending,
          todos: state.todos.map((e) =>
            e.id === newState.payload.id ? { ...e, complete: !e.complete } : e
          ),
        }
      }
    )
    const [_isPending, startTransition] = useTransition()

    useEffect(() => {
      const handler = (e: BeforeUnloadEvent) => {
        if (!state.pending) return
        e.preventDefault()
      }
      window.addEventListener("beforeunload", handler)
      return () => {
        window.removeEventListener("beforeunload", handler)
      }
    }, [state.pending])

    const todoStub: Todo = {
      id: crypto.randomUUID(),
      title: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      complete: false,
    }
    const createNewTodo = createTodo.bind(null, todoStub)

    return (
      <>
        <Form
          action={createNewTodo}
          formRef={formRef}
          disabled={state.pending}
          onSubmit={async (e) => {
            const formData = new FormData(e.currentTarget)
            formRef.current?.reset()

            startTransition(async () => {
              setOptimisticTodos({
                type: "add",
                payload: {
                  complete: false,
                  createdAt: new Date(),
                  id: crypto.randomUUID(),
                  updatedAt: new Date(),
                  title: formData.get("title")?.toString() || "",
                },
                pending: true,
              })
              await createTodo(todoStub, formData)
            })
          }}
          ref={formRef}
        />

        <ul className="pl-4">
          {state.todos.map((todo) => (
            <TodoItem
              toggleTodo={(checked: boolean) => {
                startTransition(async () => {
                  setOptimisticTodos({
                    type: "toggle",
                    payload: { id: todo.id },
                    pending: true,
                  })
                  await toggleTodo(todo.id, todo.complete)
                })
              }}
              isPending={state.pending}
              key={todo.id}
              {...todo}
            />
          ))}
        </ul>
      </>
    )
  },
  TodoItem = ({
    id,
    title,
    complete,
    isPending,
    toggleTodo: toggleTodoHandler,
  }: Todo & {
    isPending?: boolean
    toggleTodo: (checked: boolean) => unknown
  }) => {
    const toggleThisTodo = toggleTodo.bind(null, id, complete)
    const [javascript, setJavascript] = useState(false)

    useEffect(() => {
      setJavascript(true)
    }, [])

    return (
      <li
        className={`flex gap-1 items-center ${isPending ? "opacity-50" : ""}`}
      >
        <form
          action={toggleThisTodo}
          onSubmit={(e) => {
            e.preventDefault()
          }}
          className="relative"
        >
          <input
            type="checkbox"
            className="cursor-pointer peer"
            defaultChecked={complete}
            onChange={(e) => toggleTodoHandler(e.target.checked)}
            disabled={isPending}
          />
          <input
            type="submit"
            className={`absolute inset-0 z-10 opacity-0 ${
              javascript ? "hidden" : ""
            }`}
          />
        </form>
        <p className="peer-checked:line-through peer-checked:text-slate-500">
          {title}
        </p>
      </li>
    )
  }

export default Todos
