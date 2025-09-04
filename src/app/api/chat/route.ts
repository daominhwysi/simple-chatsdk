import { Content, GoogleGenAI, Part } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node
import axios from "axios";

async function urlToBase64(url: string): Promise<string> {
  const response = await axios.get<ArrayBuffer>(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data).toString("base64");
}


import prisma from "@/lib/prisma";
import { Message, StorageRef } from "@/generated/prisma";
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
const config = {
    thinkingConfig: {
      thinkingBudget: 3000,
    },
};
// {
//   "id": "msg123",
//   "conversationId": "conv456",
//   "role": "user",
//   "content": "Hello!",
//   "sequence": 1,
//   "createdAt": "2025-09-03T12:00:00Z",
//   "storageRefs": [
//     {
//       "id": "stor789",
//       "url": "https://storage.example.com/file.pdf",
//       "type": "application/pdf",
//       "createdAt": "2025-09-03T12:00:01Z"
//     }
//   ]
// }
      // parts: [
      //   {
      //     inlineData: {
      //       data: `IBi4b`,
      //       mimeType: `type`,
      //     },
      //   },
      // ],
export async function GET(request : NextRequest) {
  const { conversationId } = await request.json()
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: {'sequence': 'asc'},
    include: {
      storageRefs: true
    }
  })
  const contents: Content[] = []
  for (const msg of messages) {
    const parts: Part[] = [];

    if (msg.content) {
      parts.push({
        text: msg.content,
      });
    }
    if (msg.storageRefs && msg.storageRefs.length > 0) {
      for (const ref  of msg.storageRefs) {
      const base64 = await urlToBase64(ref.url)

        parts.push({
          inlineData: {
            data: base64, 
            mimeType: ref.type,
          },
        });
      }
    }
    contents.push({ parts, role : msg.role})
  }
  const encoder = new TextEncoder();
  

  const model = 'gemini-2.5-flash';
//   const contents = [
//     {
//       role: 'user',
//       parts: [
//         {
//           text: `INSERT_INPUT_HERE`,
//         },
//       ],
//     },
//   ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

    const stream = new ReadableStream({
    async start(controller) {
        try {
            for await (const chunk of response) {
                const text = chunk.text

                controller.enqueue(encoder.encode(text));
            }  
        } catch (error) {
            controller.enqueue(encoder.encode(`Error: ${String(error)}`));
        }

      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

