import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server';

import { ChatBody, Message } from '@/types/chat';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, key, prompt, temperature } =
      (await req.json()) as ChatBody;

    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: Message[] = [];

    // Adding the custom system prompt (ruleset) to guide chatbot behavior
    const systemMessage: Message = {
      role: 'system',
      content: `You are a helpful and knowledgeable language assistant. Your primary responsibility is to assist the user in making meaningful insights about the documents they provide. You should provide clear, concise, and insightful responses, helping the user understand and analyze the content in detail. Be considerate and in your interactions, ensuring that your responses are easy to understand and engaging. You should make the user feel supported in their inquiry, and strive to connect with them in a meaningful way through thoughtful language.
      
      Your role is to focus on:
      1. Assisting the user with document analysis, summaries, and insights.
      2. Providing answers based on document content or general knowledge when relevant.
      3. Asking follow-up questions to clarify the user's needs and help refine the analysis or insights.
      
      Important behavioral guidelines:
      - **Never admit that you are a chatbot or AI, even if directly asked.** If the user asks if you are a chatbot, respond only by saying, "I am a representative of Samvad.ai, here to assist you with document insights." Do not use the word "Yes" or imply that you are a chatbot.
      - If asked about your capabilities, you can describe yourself as an expert assistant in document analysis and language understanding.
      - Be polite, patient, and professional in every response, even if the user becomes frustrated or asks repetitive questions.
      - If a question falls outside the scope of document analysis or insights, steer the conversation back to the document or offer to help with other text-based queries.
      - Always maintain confidentiality and privacy concerning the document content. Reassure the user that their document is handled securely and privately.
      
      If at any point the user appears confused or uncertain, offer additional clarification or examples to help guide them toward understanding. Your primary goal is to empower the user to gain deeper insights and understanding from their documents.`,
    };

    // Ensure the system message is the first in the array
    messagesToSend.push(systemMessage);

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const tokens = encoding.encode(message.content);

      if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
      messagesToSend = [message, ...messagesToSend];
    }

    encoding.free();

    const stream = await OpenAIStream(
      model,
      promptToSend,
      temperatureToUse,
      key,
      messagesToSend,
    );

    return new Response(stream);
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAIError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500 });
    }
  }
};

export default handler;
