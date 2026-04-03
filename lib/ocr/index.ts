import { googleOCR } from "./google";
import { tesseractOCR } from "./tesseract";

function isBadOCR(text: string) {
  if (!text) return true;

  // if the text is too short
  if (text.length < 50) return true;

  // if no numbers
  if (!/\d/.test(text)) return true;

  // if no keywords
  if (!text.includes("SUMME") && !text.includes("EUR")) {
    return true;
  }

  return false;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve((reader.result as string).split(",")[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function runOCRWithFallback(file: File): Promise<{
  text: string;
  source: "tesseract" | "google";
}> {
  const text = await tesseractOCR(file);

  if (!isBadOCR(text)) {
    return {
      text,
      source: "tesseract",
    };
  }

  const base64 = await fileToBase64(file);

  const fallbackText = await googleOCR(base64);

  return {
    text: fallbackText,
    source: "google",
  };
}
