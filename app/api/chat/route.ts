import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const encoder = new TextEncoder();

export async function POST(req: NextRequest) {
  const { messages = [] } = await req.json();

  const contents = messages
    .filter((m: any) => m.content?.trim())
    .map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const stream = await model.generateContentStream({
    contents,
    generationConfig: { temperature: 0.7 },
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream.stream) {
        const piece = chunk.text();
        if (piece) {
          const jsonLine = JSON.stringify({ message: { content: piece } }) + "\n";
          controller.enqueue(encoder.encode(jsonLine));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
