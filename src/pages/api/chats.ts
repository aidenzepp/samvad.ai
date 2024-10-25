import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongoDB, ChatObject } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToMongoDB();

  switch (req.method) {
    case 'GET':
      try {
        const chats = await ChatObject.find({}).lean();
        res.status(200).json(chats);
      } catch (error) {
        res.status(500).json({ error: 'Unable to fetch chats' });
      }
      break;

    case 'POST':
      try {
        let chat = await ChatObject.findOne({ created_by: req.body.created_by });
        if (chat) {
          res.status(200).json(chat);
        } else {
          chat = await ChatObject.create(req.body);
          res.status(201).json(chat);
        }
      } catch (error) {
        res.status(500).json({ error: 'Unable to process chat request' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}