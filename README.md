# Samvad.ai

A document translation and interaction platform that combines OCR, translation, and AI-powered chat capabilities.

## Features

- **Document Processing**
  - Support for PDF and image files
  - OCR powered by Google Cloud Vision
  - Automatic text extraction and segmentation

- **Translation**
  - Real-time translation using Google Cloud Translate
  - Support for multiple languages
  - Preservation of original text alongside translations

- **Interactive Chat**
  - Context-aware conversations about documents
  - Powered by OpenAI's GPT models
  - Persistent chat history

## Prerequisites

- Node.js (v18+)
- MongoDB
- Google Cloud credentials
- OpenAI API key

## Installation

1. Clone the repository: 
```bash
git clone https://github.com/aidenzepp/samvad.ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file and add the following variables:
MONGODB_URI="your_mongodb_uri"
GOOGLE_APPLICATION_CREDENTIALS="path_to_your_google_cloud_credentials_file"
OPENAI_API_KEY="your_openai_api_key"
```

4. Run the development server:
```bash
npm run dev
```

## Usage

1. Upload a document (PDF or image)
2. Wait for processing and translation
3. Start chatting about the document content
4. Toggle between original and translated text

## Tech Stack

- Next.js 14
- TypeScript
- MongoDB
- Google Cloud Vision API
- Google Cloud Translate API
- OpenAI API
- PDF.js
- Tailwind CSS
- Shadcn UI

## API Endpoints

- `POST /api/ocr` - Process and translate documents
- `POST /api/openai` - Handle chat interactions
- `GET/POST /api/chats` - Manage chat sessions

## Team

- Jordyn A - Front End Development
- Nicholas F - Front End Development
- Aiden Z - Back End Development
- Anthony L - Back End Development

## License

This project is private and not open for redistribution.

## Version

0.1a