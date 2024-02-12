"use server"

import { prisma } from "@/db"
import { revalidatePath } from "next/cache"

export async function createTodo(
  prevState: { message: string },
  data: FormData
) {
  const title = data.get("title")?.valueOf()
  if (typeof title !== "string" || title.length === 0 || title === "bad") {
    revalidatePath("/") // required to optimistic updates
    return { message: "something went wrong!" }
  }

  await prisma.todo.create({ data: { title, complete: false } })
  revalidatePath("/")
  return { message: "" }
}

export const toggleTodo = (id: string, complete: boolean) =>
  prisma.todo.update({ where: { id }, data: { complete } })
