import { prisma } from "@/db"
import Todos from "./Todos"

export const dynamic = "force-dynamic"

export default async function Home() {
  const todos = await prisma.todo.findMany({ orderBy: { complete: "asc" } })

  return (
    <>
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Todos</h1>
      </header>

      <Todos todos={todos} />
    </>
  )
}
