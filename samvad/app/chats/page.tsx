"use client";

import { Chat, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useState } from "react"
import { v4 } from "uuid"
import { UUID } from "crypto"
import { toast } from "@/hooks/use-toast"

async function selectAll(): Promise<Chat[]> {
  /*
  const response = await fetch('/chats');
  if (!response.ok) {
    return [];
  }
  const chats: Chat[] = await response.json();
  return chats;
  */
  // return [];
  return [
    {
      id: "728ed52f-1234-5678-9abc-def012345678",
      user_group: ["98c4cd12-ab3e-413b-a6d9-c4da382870b6"],
      file_group: ["213a22ed-7ca5-44f2-97d5-592f71305bfa"],
      lang_model: "84c07318-9867-4bc7-bf4f-c89d4397857b",
      created_at: new Date("2023-06-01T12:00:00Z"),
      created_by: "98c4cd12-ab3e-413b-a6d9-c4da382870b6",
      updated_at: new Date("2023-06-02T14:30:00Z"),
      updated_by: "98c4cd12-ab3e-413b-a6d9-c4da382870b6"
    },
    // ...
  ]
}

async function insertOne(chat: Chat): Promise<boolean> {
  const response = await fetch('/chats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(chat),
  });

  return response.ok;
}

function ChatDataTable(chats: Chat[]) {
  if (chats.length === 0) {
    return <div className="text-center p-4 italic">No chats found</div>;
  }

  return <DataTable columns={columns} data={chats} />;
}

function ChatCreationForm() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    const newChat: Chat = {
      id: v4() as UUID, 
      user_group: ["fe4d99d2-eae8-4da9-a92f-91ba85510ff4"], 
      file_group: [],
      lang_model: "" as UUID,
      created_at: new Date(),
      created_by: "fe4d99d2-eae8-4da9-a92f-91ba85510ff4", // Replace with actual user ID
      updated_at: new Date(),
      updated_by: "fe4d99d2-eae8-4da9-a92f-91ba85510ff4", // Replace with actual user ID
    };

    // const success = await insertOne(newChat);
    const success = true;
    if (success) {
      toast({
        variant: "default",
        title: "Chat created successfully",
        description: "Your chat has been created.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Failed to create chat",
        description: "Please try again.",
      });
    }

    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Chat</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the details for your new chat.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt4">GPT-4</SelectItem>
                <SelectItem value="claude35">Claude 3.5 Sonnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="files" className="text-right">
              Files
            </Label>
            <Input id="files" className="col-span-3" />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default async function Chats() {
  const chats = await selectAll();

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
          <ChatCreationForm />
        </CardHeader>
        <CardContent>
          { ChatDataTable(chats) }
        </CardContent>
      </Card>
    </div>
  )
}
