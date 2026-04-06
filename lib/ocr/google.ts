import { env } from "../env";

export async function googleOCR(base64: string) {
  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${env.GOOGLE_VISION_API_KEY}`,
    {
      method: "POST",
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }),
    },
  );

  const data = await res.json();

  return data.responses?.[0]?.fullTextAnnotation?.text || "";
}
