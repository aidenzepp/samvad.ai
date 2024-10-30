import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: string;
  is_user: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, is_user }) => {
  return (
    <Card
      className={cn(
        "max-w-[60%] mb-4",
        is_user ? "ml-auto bg-primary text-primary-foreground" : "mr-auto"
      )}
    >
      <CardContent className="p-3">
        <p className="text-xs font-bold mb-1">{is_user ? "You" : "LLM"}</p>
        <p className="text-sm break-words whitespace-pre-wrap">{message}</p>
      </CardContent>
    </Card>
  );
};