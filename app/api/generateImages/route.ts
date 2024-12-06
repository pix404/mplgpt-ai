import Together from "together-ai";
import { z } from "zod";

// Fallback to a simple image generation API
const FALLBACK_API_URL = "https://picsum.photos/1024/768";

export async function POST(req: Request) {
  console.log("API route called");
  try {
    let json = await req.json();
    console.log("Request body:", json);

    let { prompt, count } = z
      .object({
        prompt: z.string(),
        count: z.number().min(1).max(10000).default(1),
        iterativeMode: z.boolean().optional(),
        userAPIKey: z.string().optional(),
        publicKey: z.string().optional(),
      })
      .parse(json);

    // If Together API key is not set or invalid, use fallback
    if (!process.env.TOGETHER_API_KEY || process.env.TOGETHER_API_KEY === 'tok_') {
      console.log("Using fallback API for image generation");
      try {
        // Generate multiple fallback images
        const images = Array.from({ length: count }, () => {
          const timestamp = Date.now() + Math.random();
          return {
            url: `${FALLBACK_API_URL}?t=${timestamp}`,
          };
        });
        
        return new Response(
          JSON.stringify(images),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } catch (fallbackError) {
        console.error("Fallback API Error:", fallbackError);
        return new Response(
          JSON.stringify({ error: "Failed to generate images using fallback API" }),
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
      // Generate images in parallel with concurrency control
      const CONCURRENT_REQUESTS = 5; // Adjust based on API limits
      const images = [];
      
      for (let i = 0; i < count; i += CONCURRENT_REQUESTS) {
        const batchSize = Math.min(CONCURRENT_REQUESTS, count - i);
        const batchPromises = Array.from({ length: batchSize }, () =>
          client.images.create({
            prompt,
            model: "black-forest-labs/FLUX.1-schnell",
            width: 1024,
            height: 768,
            steps: 3,
          })
        );

        const batchResponses = await Promise.all(batchPromises);
        const batchImages = batchResponses
          .map(response => response.data?.[0])
          .filter(Boolean);
        
        images.push(...batchImages);
      }

      if (images.length === 0) {
        throw new Error("No images were generated successfully");
      }

      return new Response(
        JSON.stringify(images),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (apiError: any) {
      console.error("Together API Error:", apiError);
      return new Response(
        JSON.stringify({ error: apiError?.message || "Failed to generate images" }),
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
