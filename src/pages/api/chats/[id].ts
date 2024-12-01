import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongoDB, getModels } from '@/lib/mongodb';

/**
 * API handler for managing individual chat conversations.
 * 
 * Handles GET requests to fetch chat data and PATCH requests to update chat content.
 * Chat updates can include adding new messages or modifying existing chat properties.
 * Returns 405 Method Not Allowed for unsupported HTTP methods.
 *
 * @param req - Next.js API request object containing chat ID and update data
 * @param res - Next.js API response object
 * @returns JSON response with chat data or error details
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToMongoDB();
    const { ChatObject } = getModels();
    const { id } = req.query;

    switch (req.method) {
      case 'GET':
        /**
         * Retrieves a specific chat conversation by ID.
         * Returns 404 if chat is not found.
         */
        try {
          const chat = await ChatObject.findOne({ id: id });
          if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
          }
          return res.status(200).json(chat);
        } catch (error) {
          console.error('GET Error:', error);
          return res.status(500).json({ error: 'Unable to fetch chat' });
        }

      case 'PATCH':
        /**
         * Updates a chat conversation, supporting two update patterns:
         * 1. Appending new messages to the existing message array
         * 2. Updating other chat properties using direct field updates
         * Returns 404 if chat is not found.
         */
        try {
          const updateData = req.body;
          const operation = updateData.messages ? 
            { $push: { messages: { $each: Array.isArray(updateData.messages) ? updateData.messages : [updateData.messages] } } } :
            { $set: updateData };

          const updatedChat = await ChatObject.findOneAndUpdate(
            { id: id },
            operation,
            { new: true }
          );
          if (!updatedChat) {
            return res.status(404).json({ error: 'Chat not found' });
          }
          return res.status(200).json(updatedChat);
        } catch (error) {
          console.error('PATCH Error:', error);
          return res.status(500).json({ error: 'Unable to update chat' });
        }

      default:
        res.setHeader('Allow', ['GET', 'PATCH']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Handler Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
