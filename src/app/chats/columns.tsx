"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { ChatData } from "@/lib/types"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export const columns: ColumnDef<ChatData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const id = row.getValue("id") as string
      return (
        <Link href={`/chats/${id}`} className="hover:underline">
          {id}
        </Link>
      )
    },
  },
  {
    accessorKey: "model_name",
    header: "Language Model",
    cell: ({ row }) => {
      const model_name = row.getValue("model_name") as string;
      return <div className="font-medium">{ model_name }</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const created_at = row.getValue("created_at") as Date;
      return <div className="font-medium">{ created_at.toLocaleString() }</div>;
    },
  },
];