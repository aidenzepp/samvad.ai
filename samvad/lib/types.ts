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

/* ACTUAL TYPES */
/*
export type ChatData = {
  id: UUID
  user_group: UUID[]
  file_group: UUID[]
  lang_model: UUID
  created_at: Date
  created_by: UUID
  updated_at: Date
  updated_by: UUID
};

export type FileData = {
  id: UUID
  file_name: string
  file_type: string
  file_from: string
  file_data: ArrayBuffer
  file_text: string
  languages: string[]
};

export type UserData = {
  id: UUID
  username: string
  password: string
};

export type Model = {
  id: UUID
  model_name: string
};
*/