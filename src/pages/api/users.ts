import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB, UserObject } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToMongoDB();

  switch (req.method) {
    case "POST":
      const { action } = req.body; // Determine the action from the request body

      if (action === "register") {
        // Handle registration
        try {
          const { username, password } = req.body;

          // Check if the user already exists
          const existingUser = await UserObject.findOne({ username });
          if (existingUser) {
            return res.status(409).json({ error: "Username already exists" });
          }

          // Hash the password before saving
          const hashedPassword = await bcrypt.hash(password, 10);

          // Create a new user
          const newUser = await UserObject.create({
            id: uuidv4(),
            username,
            password: hashedPassword,
          });
          res.status(201).json({ id: newUser._id, username: newUser.username });
        } catch (error) {
          console.error("Error creating user:", error);
          res.status(500).json({ error: "Unable to create user" });
        }
      } else if (action === "login") {
        // Handle login
        try {
          const { username, password } = req.body;

          // Check if the user exists
          const user = await UserObject.findOne({ username });
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }

          // Compare the provided password with the stored hashed password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
          }

          // If login is successful, return user data (excluding password)
          const { password: _, ...userData } = user.toObject();
          res.status(200).json(userData);
        } catch (error) {
          console.error("Error logging in:", error);
          res.status(500).json({ error: "Unable to log in" });
        }
      } else {
        res.status(400).json({ error: "Invalid action" });
      }
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}