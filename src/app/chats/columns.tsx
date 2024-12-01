"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { ChatSchema } from "@/lib/mongodb"
import Link from 'next/link'

/**
 * Column definitions for the chats data table
 * 
 * Defines the structure and behavior of columns in the chats table, including:
 * - Checkbox column for row selection
 * - Chat ID column with links to individual chats
 * - Language model name column
 * - Creation timestamp column
 *
 * @type {ColumnDef<ChatSchema>[]}
 */
export const columns: ColumnDef<ChatSchema>[] = [
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
    /**
     * Renders a clickable chat ID that links to the chat detail page
     * @param {Object} row - The current table row
     * @returns {JSX.Element} Link component wrapping the chat ID
     */
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
    /**
     * Displays the AI model name used for the chat
     * @param {Object} row - The current table row
     * @returns {JSX.Element} Div containing the model name
     */
    cell: ({ row }) => {
      const model_name = row.getValue("model_name") as string;
      return <div className="font-medium">{ model_name }</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    /**
     * Formats and displays the chat creation timestamp
     * @param {Object} row - The current table row
     * @returns {JSX.Element} Div containing the formatted timestamp
     */
    cell: ({ row }) => {
      const created_at = row.getValue("created_at") as Date;
      return <div className="font-medium">{ created_at.toLocaleString() }</div>;
    },
  },
];