import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB, UserObject } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToMongoDB();

  switch (req.method) {
    case "GET":
      try {
        const { id } = req.query;

        if (id) {
          const user = await UserObject.findOne({ id }).lean();
          if (user) {
            res.status(200).json(user);
          } else {
            res.status(404).json({ error: "User not found" });
          }
        } else {
          const users = await UserObject.find({}).lean();
          res.status(200).json(users);
        }
      } catch (error) {
        res.status(500).json({ error: "Unable to fetch users" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

