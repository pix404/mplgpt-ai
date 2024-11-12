// For Pages Router (pages/api/proxyImage.ts)
import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   const { url } = req.query;

//   if (!url || typeof url !== "string") {
//     return res.status(400).json({ error: "URL is required" });
//   }

//   try {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     const arrayBuffer = await blob.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Set appropriate headers
//     res.setHeader(
//       "Content-Type",
//       response.headers.get("content-type") || "image/jpeg",
//     );
//     res.send(buffer);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch image" });
//   }
// }

// OR for App Router (app/api/proxyImage/route.ts)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new Response("URL is required", { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Response(blob, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
      },
    });
  } catch (error) {
    return new Response("Failed to fetch image", { status: 500 });
  }
}
