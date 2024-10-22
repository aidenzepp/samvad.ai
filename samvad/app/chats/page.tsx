"use client";

import { columns } from "./columns"
import { UUID } from "crypto"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus } from "lucide-react"
import { ChatCreationForm } from "@/components/chat-creation-form";

export default async function Chats() {
  const chats = [
    {
      id: crypto.randomUUID() as UUID,
      file_group: [],
      model_name: "GPT-4o",
      created_by: crypto.randomUUID() as UUID,
      created_at: new Date(),
    },
    {
      id: crypto.randomUUID() as UUID,
      file_group: [],
      model_name: "GPT-4o",
      created_by: crypto.randomUUID() as UUID,
      created_at: new Date(),
    },
    {
      id: crypto.randomUUID() as UUID,
      file_group: [],
      model_name: "GPT-4o",
      created_by: crypto.randomUUID() as UUID,
      created_at: new Date(),
    },
  ];

  return (
    <div className="flex-1 p-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Chats</CardTitle>
            <CardDescription>
              A list of all your chats.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <ChatCreationForm />
            <Button variant="outline" size="icon">
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={chats} />
        </CardContent>
      </Card>
    </div>
  )
}
