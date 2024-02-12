import { TodoItem } from "@/app/TodoItem"
import { Todo } from "@prisma/client"
import React from "react"

const TodoList = ({ todos }: { todos: Todo[] }) => {
  return (
    <ul className="pl-4">
      {todos.map((todo) => (
        <TodoItem key={todo.id} {...todo} />
      ))}
    </ul>
  )
}

export default TodoList
