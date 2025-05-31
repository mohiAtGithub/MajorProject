// import { NextResponse } from 'next/server';
// import Tesseract from 'tesseract.js';

// export async function POST(req: Request) {
//   const { image } = await req.json();
//   console.log("Received image for OCR:", image);

//   try {
//     const imageBuffer = Buffer.from(image, 'base64');
//     const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');

//     return NextResponse.json({ text });
//   } catch (err) {
//     console.error("OCR error:", err);
//     return NextResponse.json({ error: "OCR failed" }, { status: 500 });
//   }
// }

// // export async function GET() {
// //   return NextResponse.json({ status: "OCR API is running. Use POST." });
// // }

// app/api/recognize-text/route.js

export async function POST(req:any) {
  try {
    const { base64Image } = await req.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`, // ✅ secure from .env
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract ONLY the handwritten text from this image. Return ONLY the text without any explanation or description.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });
    console.log("Response status:", response.status); // Add this


    const data = await response.json();
    console.log("hi")
    const message = data.choices?.[0]?.message?.content || "No text found";
    console.log("OpenAI response:", data);

    return new Response(JSON.stringify({ text: message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error recognizing handwriting:", error);
    return new Response(JSON.stringify({ error: "Failed to process image" }), {
      status: 500,
    });
  }
}
