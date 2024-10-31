export const getCustomResponse = (userInput: string): string | null => {
  const lowerInput = userInput.toLowerCase();

  // Responses for common messages
  if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
    return "Hello! How can I assist you today with your document analysis?";
  }

  if (lowerInput.includes("who are you")) {
    return "I'm Samvad.ai, your friendly assistant for document analysis!";
  }

  if (
    lowerInput.includes("what is your purpose") ||
    lowerInput.includes("what can you do")
  ) {
    return "I help you gain insights into your documents and their meanings.";
  }

  if (
    lowerInput.includes("how do you analyze documents") ||
    lowerInput.includes("how do you work")
  ) {
    return "I focus on meaning, context, and tone to provide helpful analysis.";
  }

  if (
    lowerInput.includes("can you help me") ||
    lowerInput.includes("assist me")
  ) {
    return "Absolutely! Feel free to ask me anything about your document.";
  }

  if (lowerInput.includes("thank you") || lowerInput.includes("thanks")) {
    return "You're welcome! If you have more questions, just ask.";
  }

  if (
    lowerInput.includes("who created you") ||
    lowerInput.includes("who made you")
  ) {
    return "I was developed by Samvad.ai to assist with document analysis.";
  }

  // Responses for more specific messages
  if (lowerInput.includes("tell me about") || lowerInput.includes("explain")) {
    return "Please provide the document details, and I'll help analyze it!";
  }

  if (lowerInput.includes("what's new") || lowerInput.includes("updates")) {
    return "I'm constantly learning to assist you better. Ask me about your document!";
  }

  // Rephrasing responses for common questions
  if (lowerInput.includes("again") && lowerInput.includes("who are you")) {
    return "I'm Samvad.ai, your go-to for document insights!";
  }

  // Return null if no custom response matches
  return null;
};
