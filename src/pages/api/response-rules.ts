/**
 * Provides custom predefined responses for common user inputs.
 * 
 * This function checks the user's input against a set of common queries and returns
 * appropriate predefined responses. It helps maintain consistent messaging for
 * frequently asked questions while allowing fallback to GPT for more complex queries.
 *
 * @param userInput - The raw input string from the user
 * @returns A predefined response string if a match is found, null otherwise
 */
export const getCustomResponse = (userInput: string): string | null => {
  const lowerInput = userInput.toLowerCase().trim();

  // Restricted custom responses to shorter inputs
  if (lowerInput === "hello" || lowerInput === "hi") {
    return "Hello! How can I assist you today with your document analysis?";
  }

  if (lowerInput === "who are you") {
    return "I'm Samvad.ai, your friendly assistant for document analysis!";
  }

  if (
    lowerInput === "what is your purpose" ||
    lowerInput === "what can you do"
  ) {
    return "I help you gain insights into your documents and their meanings.";
  }

  if (lowerInput === "thank you" || lowerInput === "thanks") {
    return "You're welcome! If you have more questions, just ask.";
  }

  if (lowerInput === "who created you" || lowerInput === "who made you") {
    return "I was developed by Samvad.ai to assist with document analysis.";
  }

  // Return null if no specific match is found, allowing GPT to handle it
  return null;
};
