import Together from "together-ai";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";

import { headers } from "next/headers";
import RedisSingleton from "@/app/redis";

// Add rate limiting if Upstash API keys are set, otherwise skip
// if (process.env.REDIS_URL) {
//   const redisClient = RedisSingleton.getInstance();
// }

export async function POST(req: Request) {
  let json = await req.json();
  let { prompt, userAPIKey, iterativeMode, publicKey } = z
    .object({
      prompt: z.string(),
      iterativeMode: z.boolean(),
      userAPIKey: z.string().optional(),
      publicKey: z.string().optional(),
    })
    .parse(json);

  // Add observability if a Helicone key is specified, otherwise skip
  let options: ConstructorParameters<typeof Together>[0] = {};
  if (process.env.HELICONE_API_KEY) {
    options.baseURL = "https://together.helicone.ai/v1";
    options.defaultHeaders = {
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      "Helicone-Property-BYOK": userAPIKey ? "true" : "false",
    };
  }

  const client = new Together(options);
  const redisClient = await RedisSingleton.getInstance();

  if (userAPIKey) {
    client.apiKey = userAPIKey;
  }

  // if (!userAPIKey) {
  //   const identifier = getIPAddress();

  //   return Response.json(
  //     "No requests left. Please add your own API key or try again in 24h.",
  //     {
  //       status: 429,
  //     },
  //   );
  // }

  let response;
  try {
    response = await client.images.create({
      prompt,
      model: "black-forest-labs/FLUX.1-schnell",
      width: 1024,
      height: 768,
      seed: iterativeMode ? 123 : undefined,
      steps: 3,
    });

    console.log(response);
    // Store the image in Redis
    const imageId = response.id || ""; // Assuming the response contains an image ID
    const redisKey = `${publicKey}:${imageId}`;
    await redisClient.set(redisKey, JSON.stringify(response.data[0]));
  } catch (e: any) {
    return Response.json(
      { error: e.toString() },
      {
        status: 500,
      },
    );
  }
  console.log(response);

  return Response.json(response.data[0]);
}
function getIPAddress() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers().get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}
