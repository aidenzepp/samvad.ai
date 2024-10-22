"use client";

import { useEffect} from "react";
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
      id: "c14b9dba-3ac7-4749-8826-a35b0d68ab05" as UUID,
      file_group: [],
      model_name: "GPT-4o",
      created_by: "1eeb659f-8c42-4794-bb1f-62e30362a0c7" as UUID,
      created_at: new Date(),
    },
    {
      id: "8d292bc8-5c22-4cbd-9356-dfd16b327bbe" as UUID,
      file_group: [],
      model_name: "GPT-4o",
      created_by: "1eeb659f-8c42-4794-bb1f-62e30362a0c7" as UUID,
      created_at: new Date(),
    },
    {
      id: "31a1e75a-1104-4e67-b3ae-0b9f542080e9" as UUID,
      file_group: [],
      model_name: "GPT-4o",
      created_by: "1eeb659f-8c42-4794-bb1f-62e30362a0c7" as UUID,
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
  );
}
