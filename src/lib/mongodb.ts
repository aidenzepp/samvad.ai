import mongoose from "mongoose";
import { Schema, model } from "mongoose";
import { UUID } from "crypto";

export interface UserSchema {
  id: string
  username: string
  password: string
}

export interface FileSchema {
  name: string
  data: Buffer
  extractedText?: string
  translatedText?: string
}

export interface ChatSchema {
  id: UUID
  file_group: FileSchema[]
  model_name: string
  created_by: UUID
  created_at: Date
}

const UserSchema = new Schema<UserSchema>({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
})



const FileSchema = new Schema<FileSchema>({
  name: { type: String, required: true },
  data: { type: Buffer, required: true },
  extractedText: { type: String },
  translatedText: { type: String },
})

const ChatSchema = new Schema<ChatSchema>({
  id: { type: String, required: true, unique: true },
  file_group: [FileSchema],
  model_name: { type: String, required: true },
  created_by: { type: String, required: true },
  created_at: { type: Date, required: true },
})

export const UserObject = mongoose.models.User || model<UserSchema>("User", UserSchema)
export const FileObject = mongoose.models.File || model<FileSchema>("File", FileSchema)
export const ChatObject = mongoose.models.Chat || model<ChatSchema>("Chat", ChatSchema)

declare global {
  var mongoose: { conn: any; promise: any } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/samvad';
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (globalThis as any).mongoose as { conn: any; promise: any } | undefined;
if (!cached) {
  cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

export async function connectToMongoDB() {
  if (cached!.conn) {
    return cached!.conn;
  }
  
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
