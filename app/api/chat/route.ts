import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // stream from Ollama (local) — change URL/model as needed
  const ollamaRes = await fetch('http://localhost:11434/api/chat', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ model: 'llama3', messages, stream: true }),
  });

  // pass Ollama’s JSON-lines stream straight through
  return new NextResponse(ollamaRes.body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
