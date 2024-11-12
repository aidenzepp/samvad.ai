import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongoDB, getModels } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToMongoDB();
    const { ChatObject } = getModels();
    const { id } = req.query;

    switch (req.method) {
      case 'GET':
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
