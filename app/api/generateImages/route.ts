import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

let ratelimit: Ratelimit | undefined;

// Add rate limiting if Upstash API keys are set, otherwise skip
if (process.env.UPSTASH_REDIS_REST_URL) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    // Allow 100 requests per day (~5-10 prompts)
    limiter: Ratelimit.fixedWindow(100, "1440 m"),
    analytics: true,
    prefix: "mplgpt",
  });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { prompt, userAPIKey, iterativeMode } = z
      .object({
        prompt: z.string(),
        iterativeMode: z.boolean(),
        userAPIKey: z.string().optional(),
      })
      .parse(json);

    if (ratelimit && !userAPIKey) {
      const identifier = getIPAddress();
      const { success } = await ratelimit.limit(identifier);
      
      if (!success) {
        return NextResponse.json(
          { error: "No requests left. Please add your own API key or try again in 24h." },
          { status: 429 }
        );
      }
    }

    // Mock response for development
    const mockResponse = {
      data: [{
        b64_json: "",
        timings: { inference: 100 }
      }]
    };

    return NextResponse.json(mockResponse.data[0]);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

function getIPAddress() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers().get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}

export const runtime = "edge";