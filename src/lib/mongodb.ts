import mongoose from "mongoose";
import { Schema, model } from "mongoose";

// MongoDB connection function
export async function connectToMongoDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    // Drop and recreate chats collection
    try {
      await db.dropCollection('chats');
    } catch (e) {
      // Collection might not exist
    }

    // Create collection with no validation
    await db.createCollection('chats');

    // Explicitly remove all validation
    await db.command({
      collMod: 'chats',
      validator: undefined,
      validationLevel: 'off',
      validationAction: 'warn'
    });

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Export the getModels function and its return type
export interface Models {
  ChatObject: mongoose.Model<any>;
  UserObject: mongoose.Model<any>;
}

export const getModels = (): Models => {
  const FileSchema = new Schema({
    name: String,
    data: Buffer,
    extractedText: String,
    translatedText: String
  }, { _id: false });

  const MessageSchema = new Schema({
    message: String,
    is_user: Boolean,
    timestamp: { type: Date, default: Date.now }
  }, { _id: false });

  const ChatSchema = new Schema({
    id: { type: String, required: true, unique: true },
    file_group: [FileSchema],
    model_name: { type: String, required: true },
    created_by: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    messages: [MessageSchema]
  }, {
    timestamps: true
  });

  const UserSchema = new Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  }, {
    timestamps: true
  });

  return {
    ChatObject: mongoose.models.Chat || model("Chat", ChatSchema),
    UserObject: mongoose.models.User || model("User", UserSchema)
  };
};
