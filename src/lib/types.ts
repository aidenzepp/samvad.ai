import { UUID } from "crypto";

export type ChatData = {
  id: UUID
  file_group: FileData[]
  model_name: string
  created_by: UUID
  created_at: Date
};

export type FileData = {
  name: string
  data: string
};

export type UserData = {
  id: UUID
  username: string
  password: string
};
/
