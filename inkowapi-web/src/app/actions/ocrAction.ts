"use server";
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient({
  keyFilename: "./gcp-key.json",
});

export async function processOCR(formData: FormData) {
  try {
    const file = formData.get("document") as File;
    const type = formData.get("type") as string;
    
    if (!file) return { success: false, error: "No document detected." };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const [result] = await client.textDetection(buffer);
    const detections = result.textAnnotations;
    const rawText = detections?.[0]?.description || "";

    let extracted = { name: "", idNumber: "", province: "", city: "" };

    if (type === "ktp") {
      const nikMatch = rawText.match(/\d{16}/);
      extracted.idNumber = nikMatch ? nikMatch[0] : "";
      
      const nameMatch = rawText.match(/Nama\s*[:\s]*([^\n]+)/i);
      extracted.name = nameMatch ? nameMatch[1].trim().toUpperCase() : "";

      const provMatch = rawText.match(/PROVINSI\s*([^\n]+)/i);
      extracted.province = provMatch ? provMatch[1].trim() : "";
    } else {
      const npwpMatch = rawText.match(/\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}/);
      extracted.idNumber = npwpMatch ? npwpMatch[0] : "";
    }

    return { success: true, data: extracted };
  } catch (error) {
    console.error("GCP OCR ERROR:", error);
    return { success: false, error: "OCR Handshake Failed" };
  }
}