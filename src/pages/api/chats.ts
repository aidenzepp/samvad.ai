import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongoDB, getModels } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    const { ChatObject, UserObject } = getModels();
    console.log('Connected to MongoDB');

    switch (req.method) {
      case 'GET':
        try {
          const userId = req.query.userId || req.headers['user-id'];
          if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
          }
          
          const chats = await ChatObject.find({
            created_by: {
              $in: [
                userId,
                ...(typeof userId === 'string' && userId.match(/^[0-9a-fA-F]{24}$/) ? [new ObjectId(userId)] : [])
              ]
            }
          }).lean();
          res.status(200).json(chats);
        } catch (error) {
          console.error('GET Error:', error);
          res.status(500).json({ error: 'Unable to fetch chats' });
        }
        break;

      case 'POST':
        try {
          console.log('Received POST request with body:', req.body);
          const { id, file_group, model_name, created_by, created_at } = req.body;
          
          // Enhanced validation with logging
          if (!id || !created_by || !model_name) {
            console.log('Validation failed:', { id, created_by, model_name });
            return res.status(400).json({ 
              error: 'Missing required fields',
              required: ['id', 'created_by', 'model_name'],
              received: { id, created_by, model_name }
            });
          }

          console.log('Looking up user:', created_by);
          const user = await UserObject.findOne({
            $or: [
              { id: created_by },
              ...(created_by.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: created_by }] : [])
            ]
          });

          if (!user) {
            console.log('User not found:', created_by);
            return res.status(400).json({ 
              error: 'Invalid user ID',
              details: 'User not found in database',
              userId: created_by
            });
          }

          console.log('Creating chat with data:', {
            id,
            file_group: file_group || [],
            model_name,
            created_by,
            created_at
          });

          const chat = await ChatObject.create({
            id: id,
            file_group: Array.isArray(file_group) ? file_group : [],
            model_name: model_name,
            created_by: created_by,
            created_at: new Date(created_at || Date.now())
          });

          console.log('Chat created successfully:', chat);
          return res.status(201).json(chat);
        } catch (error) {
          console.error('POST Error:', error);
          console.error('Error stack:', (error as Error).stack);
          return res.status(500).json({ 
            error: 'Unable to process chat request', 
            details: (error as Error).message,
            stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
          });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Handler Error:', error);
    console.error('Error stack:', (error as Error).stack);
    return res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
}