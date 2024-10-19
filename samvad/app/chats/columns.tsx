"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UUID } from "crypto"

export type Chat = {
  id: UUID
  user_group: UUID[]
  file_group: UUID[]
  lang_model: UUID
  created_at: Date
  created_by: UUID
  updated_at: Date
  updated_by: UUID
};

export const columns: ColumnDef<Chat>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "lang_model",
    header: "Language Model",
    cell: ({ row }) => {
        return <div className="font-medium">{ "GPT-4o" }</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      return <div className="font-medium">{ row.original.created_at.toLocaleString() }</div>;
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
    cell: ({ row }) => {
      return <div className="font-medium">{ row.original.updated_at.toLocaleString() }</div>;
    },
  },
];
