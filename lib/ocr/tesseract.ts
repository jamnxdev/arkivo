import { createWorker } from "tesseract.js";

export async function tesseractOCR(file: File) {
  const worker = await createWorker("eng+deu");
  const result = await worker.recognize(file);
  await worker.terminate();

  return result.data.text;
}
