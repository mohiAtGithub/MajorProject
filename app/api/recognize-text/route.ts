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

// export async function POST(req:any) {
//   try {
//     const { base64Image } = await req.json();

//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer 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`, // ✅ secure from .env
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "gpt-o4-mini",
//         messages: [
//           {
//             role: "user",
//             content: [
//               {
//                 type: "text",
//                 text: "Extract ONLY the handwritten text from this image. Return ONLY the text without any explanation or description.",
//               },
//               {
//                 type: "image_url",
//                 image_url: {
//                   url: `data:image/jpeg;base64,${base64Image}`,
//                 },
//               },
//             ],
//           },
//         ],
//         max_tokens: 1000,
//       }),
//     });
//     console.log("Response status:", response.status); // Add this


//     const data = await response.json();
//     console.log("OPEN AI response status:", data);
//     const message = data.choices?.[0]?.message?.content || "No text found";
//     console.log("OpenAI response:", data);

//     return new Response(JSON.stringify({ text: message }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error recognizing handwriting:", error);
//     return new Response(JSON.stringify({ error: "Failed to process image" }), {
//       status: 500,
//     });
//   }
// }

// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { base64Image } = await req.json();

//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.TESTING}`, // ✅ Use .env for security
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "gpt-4.1", // ✅ Ensure your account has GPT-4o access
//         messages: [
//           {
//             role: "user",
//             content: [
//               {
//                 type: "text",
//                 text: "Extract ONLY the handwritten text from this image. Return ONLY the text without any explanation or formatting.",
//               },
//               {
//                 type: "image_url",
//                 image_url: {
//                   url: `data:image/jpeg;base64,${base64Image}`,
//                 },
//               },
//             ],
//           },
//         ],
//         max_tokens: 1000,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("OpenAI API error:", data);
//       return NextResponse.json({ error: data }, { status: response.status });
//     }

//     const message = data.choices?.[0]?.message?.content || "No text found";

//     return NextResponse.json({ text: message }, { status: 200 });
//   } catch (error) {
//     console.error("Error recognizing handwriting:", error);
//     return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { base64Image } = await req.json();

//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // 🔐 Ensure correct API key
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "gpt-4o", // ✅ Use vision-enabled GPT-4o model
//         messages: [
//           {
//             role: "user",
//             content: [
//               {
//                 type: "text",
//                 text: "Extract ONLY the handwritten text from this image. Return ONLY the text without any explanation or formatting.",
//               },
//               {
//                 type: "image_url",
//                 image_url: {
//                   url: `data:image/jpeg;base64,${base64Image}`,
//                 },
//               },
//             ],
//           },
//         ],
//         max_tokens: 1000,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("OpenAI API error:", data);
//       return NextResponse.json({ error: data }, { status: response.status });
//     }

//     const message = data.choices?.[0]?.message?.content || "No text found";

//     return NextResponse.json({ text: message }, { status: 200 });
//   } catch (error) {
//     console.error("Error recognizing handwriting:", error);
//     return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import vision from "@google-cloud/vision";
// import path from "path";

// // Load keyfile from env path
// process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(process.cwd(), "vision-key.json");

// const client = new vision.ImageAnnotatorClient();

// export async function POST(req: NextRequest) {
//   try {
//     const { base64Image } = await req.json();

//     const imageBuffer = Buffer.from(base64Image, "base64");

//     const [result] = await client.documentTextDetection({
//       image: { content: imageBuffer },
//     });

//     const text = result.fullTextAnnotation?.text || "No text found";

//     return NextResponse.json({ text });
//   } catch (error) {
//     console.error("Google Vision OCR Error:", error);
//     return NextResponse.json({ error: "Failed to extract text" }, { status: 500 });
//   }
// }


export async function POST(req:any) {
  try {
    const { publicImageUrl } = await req.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", 
      headers: {
        Authorization: `Bearer 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`, // ✅ secure from .env
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Ensure you have access to this model
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
                  url: publicImageUrl,
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
    // const message = data.choices?.[0]?.message?.content || "No text found";
    const message = data.choices?.[0]?.message?.content || "No text found";

    console.log("OpenAI response:", data);
    console.log("message : ", message);

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

// export async function POST(req: any) {
//   try {
//     const { publicImageUrl } = await req.json();

//     const apiKey = process.env.GEMINI_API_KEY; // Put your Gemini API key in env vars

//     const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         requests: [
//           {
//             image: {
//               source: {
//                 imageUri: publicImageUrl,
//               },
//             },
//             features: [
//               {
//                 type: "TEXT_DETECTION", // For OCR/text extraction
//                 maxResults: 1,
//               },
//             ],
//           },
//         ],
//       }),
//     });

//     console.log("Response status:", response.status);

//     const data = await response.json();
//     console.log("Gemini Vision API response:", data);

//     // Extract detected text from the response
//     const textAnnotations = data.responses?.[0]?.textAnnotations;
//     const extractedText = textAnnotations?.[0]?.description || "No text found";

//     console.log("Extracted text:", extractedText);

//     return new Response(JSON.stringify({ text: extractedText }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error recognizing handwriting:", error);
//     return new Response(JSON.stringify({ error: "Failed to process image" }), {
//       status: 500,
//     });
//   }
// }
