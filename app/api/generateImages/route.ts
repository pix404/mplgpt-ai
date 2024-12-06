import Together from "together-ai";
import { z } from "zod";

// Fallback to a simple image generation API
const FALLBACK_API_URL = "https://picsum.photos/1024/768";

export async function POST(req: Request) {
  console.log("API route called");
  try {
    let json = await req.json();
    console.log("Request body:", json);

    let { prompt } = z
      .object({
        prompt: z.string(),
        iterativeMode: z.boolean().optional(),
        userAPIKey: z.string().optional(),
        publicKey: z.string().optional(),
      })
      .parse(json);

    // If Together API key is not set or invalid, use fallback
    if (!process.env.TOGETHER_API_KEY || process.env.TOGETHER_API_KEY === 'tok_') {
      console.log("Using fallback API for image generation");
      try {
        // Add random query parameter to prevent caching
        const timestamp = Date.now();
        const fallbackUrl = `${FALLBACK_API_URL}?t=${timestamp}`;
        
        // For demo purposes, we'll return a random image
        return new Response(
          JSON.stringify({ 
            url: fallbackUrl,
            note: "Using fallback random image API (for demo purposes)"
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } catch (fallbackError) {
        console.error("Fallback API Error:", fallbackError);
        return new Response(
          JSON.stringify({ error: "Failed to generate image using fallback API" }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // If Together API key is valid, use it
    console.log("Using Together API for image generation");
    const client = new Together({
      apiKey: process.env.TOGETHER_API_KEY
    });
    
    try {
      const response = await client.images.create({
        prompt,
        model: "black-forest-labs/FLUX.1-schnell",
        width: 1024,
        height: 768,
        steps: 3,
      });

      console.log("Together API Response:", JSON.stringify(response, null, 2));

      if (!response.data?.[0]) {
        throw new Error("No image data returned from Together API");
      }

      return new Response(
        JSON.stringify(response.data[0]),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (apiError: any) {
      console.error("Together API Error:", apiError);
      return new Response(
        JSON.stringify({ error: apiError?.message || "Failed to generate image" }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (e: any) {
    console.error("Request processing error:", e);
    return new Response(
      JSON.stringify({ error: e?.message || "Internal server error" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
