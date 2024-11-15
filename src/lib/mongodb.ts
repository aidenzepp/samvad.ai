import mongoose from "mongoose";
import { Schema, model } from "mongoose";

/**
 * MongoDB connection handler that manages database connectivity and schema initialization.
 * 
 * This function handles:
 * - Establishing connection to MongoDB using the provided URI from environment variables
 * - Reusing existing connections if already established
 * - Initializing the chats collection with no validation constraints
 * - Error handling for connection failures
 * 
 * @throws {Error} If MONGODB_URI environment variable is not defined
 * @throws {Error} If MongoDB connection fails
 * @returns {Promise<mongoose.Connection>} A promise that resolves to the mongoose connection object
 */
export async function connectToMongoDB() {
  try {
    // Return existing connection if already established
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // Validate and get MongoDB connection URI from environment
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    // Establish connection to MongoDB
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Failed to get database instance');
    }

    // Drop existing chats collection if it exists
    try {
      await db.dropCollection('chats');
    } catch (e) {
      // Collection might not exist, safe to ignore error
    }

    // Create fresh chats collection
    await db.createCollection('chats');

    // Configure collection with no schema validation
    // This allows flexible document structures needed for chat data
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

/**
 * Interface defining the structure of MongoDB models used in the application.
 */
export interface Models {
  ChatObject: mongoose.Model<any>;
  UserObject: mongoose.Model<any>;
}

/**
 * Factory function that creates and returns MongoDB models for the application.
 * 
 * This function defines schemas for:
 * - Files: Storing document data and extracted/translated text
 * - Messages: Chat messages with timestamps
 * - Chats: Groups of messages and associated files
 * - Users: User authentication and profile data
 * 
 * The function ensures models are only created once by checking if they already exist
 * in mongoose.models before creating new ones.
 * 
 * @returns {Models} An object containing Chat and User mongoose models
 */
export const getModels = (): Models => {
  // Schema for storing document files and their processed text
  const FileSchema = new Schema({
    name: String,
    data: Buffer,
    extractedText: String,
    translatedText: String
  }, { _id: false });

  // Schema for individual chat messages
  const MessageSchema = new Schema({
    message: String,
    is_user: Boolean,
    timestamp: { type: Date, default: Date.now }
  }, { _id: false });

  // Schema for chat sessions containing messages and associated files
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

  // Schema for user accounts and authentication
  const UserSchema = new Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  }, {
    timestamps: true
  });

  // Return existing models if already defined, otherwise create new ones
  return {
    ChatObject: mongoose.models.Chat || model("Chat", ChatSchema),
    UserObject: mongoose.models.User || model("User", UserSchema)
  };
};
