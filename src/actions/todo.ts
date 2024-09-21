"use server"

import { prisma } from "@/db"
import { Todo } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createTodo(todo: Todo, data: FormData) {
  const title = data.get("title")?.valueOf()
  if (typeof title !== "string" || title.length === 0 || title === "bad") {
    revalidatePath("/") // required to optimistic updates
    return { message: "something went wrong!" }
  }

  const todoData = { ...todo, title }
  await prisma.todo.upsert({
    create: todoData,
    update: todoData,
    where: { id: todoData.id },
  })
  revalidatePath("/")
  return { message: "" }
}

export const toggleTodo = async (id: string, complete: boolean) => {
  await prisma.todo.update({ where: { id }, data: { complete } })
  revalidatePath("/")
  return { message: "" }
}
