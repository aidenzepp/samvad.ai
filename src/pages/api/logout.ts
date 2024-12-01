import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API handler for user logout functionality.
 * 
 * Handles POST requests to logout users by clearing their authentication cookie.
 * Returns 405 Method Not Allowed for non-POST requests.
 *
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Clear the cookie by setting it to expire
    res.setHeader('Set-Cookie', 'uid=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict');
    return res.status(200).json({ message: 'Logged out successfully' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
