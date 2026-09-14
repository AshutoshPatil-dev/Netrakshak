/**
 * Netrakshak Document Intelligence & Vision OCR Engine
 * Integrates Google Gemini Vision API for multilingual (Devanagari / English)
 * handwritten & printed FIR intake, entity extraction, and legal section parsing.
 */

// Key retrieval hierarchy: localStorage -> Vite environment variable -> empty
export function getGeminiApiKey() {
  return localStorage.getItem('netrakshak_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function setGeminiApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem('netrakshak_gemini_key', key.trim());
  } else {
    localStorage.removeItem('netrakshak_gemini_key');
  }
}

/**
 * Convert a File or Blob into base64 data and mimeType
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const commaIdx = result.indexOf(',');
        const base64Data = commaIdx !== -1 ? result.slice(commaIdx + 1) : result;
        const mimeType = file.type || 'image/jpeg';
        resolve({ base64Data, mimeType });
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

const FIR_SYSTEM_INSTRUCTION = `You are Netrakshak, an expert Indian Police Crime Investigation & Document Intelligence system.
Your task is to analyze the provided image of an Indian Police FIR (First Information Report), General Diary (GD) entry, complaint letter, or police statement.
Read both printed and handwritten text in English, Hindi (Devanagari), or Marathi (Devanagari).

Extract all structured fields and criminal intelligence entities. Return ONLY a valid, single JSON object with the following schema:
{
  "policeStation": "Name of Police Station and City/Jurisdiction",
  "district": "District name (e.g., Pune City, Mumbai, Thane)",
  "state": "State name (e.g., Maharashtra)",
  "firNumber": "FIR or GD Number (e.g., FIR-MH-2026-4821)",
  "incidentDate": "YYYY-MM-DD format if available, or best estimate",
  "incidentTime": "HH:MM format in 24-hr time",
  "sections": "Relevant legal sections (e.g., IPC 420, IPC 384, IT Act 66D, BNS 318)",
  "complainantName": "Full name of the complainant or victim",
  "complainantAge": "Age of complainant if mentioned",
  "complainantFather": "Father or spouse name of complainant",
  "complainantPhone": "Phone number of complainant",
  "complainantAddress": "Residential or business address of complainant",
  "subjectName": "Primary accused / suspect person name",
  "alias": "Known aliases / nicknames (e.g., Sammy, Anna, Baba Bhai)",
  "otherAccused": "Comma-separated names of co-accused or associates",
  "incidentLocation": "Specific scene of crime / location",
  "phone": "Suspect / fraudulent phone numbers involved",
  "vehicle": "Vehicle registration number and make/model if mentioned",
  "bank": "Bank name, account number, or UPI ID involved",
  "incidentSummary": "Concise factual summary of the modus operandi and criminal act (2-4 sentences)",
  "propertySummary": "Summary of stolen property, seized evidence, or defrauded amount",
  "scriptDetected": "e.g., 'Handwritten Devanagari (Marathi) + English' or 'Computerized English Form II'",
  "confidence": 96.5
}`;

/**
 * Perform Vision OCR & Entity Extraction using Gemini 1.5 Flash
 */
export async function extractFIRWithVision(file, apiKeyOverride = '') {
  const apiKey = apiKeyOverride || getGeminiApiKey();

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const { base64Data, mimeType } = await fileToBase64(file);

  // Gemini 1.5 Flash Endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: FIR_SYSTEM_INSTRUCTION },
          {
            inline_data: {
              mime_type: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: "application/json"
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const msg = errorBody?.error?.message || `Gemini API returned status ${response.status}`;
    throw new Error(msg);
  }

  const result = await response.json();
  const textOutput = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Empty response received from Vision OCR engine.');
  }

  try {
    const parsedData = JSON.parse(textOutput);
    return {
      success: true,
      liveAI: true,
      data: parsedData,
      rawResponse: textOutput
    };
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', textOutput);
    throw new Error('Invalid JSON format returned by Vision engine.');
  }
}
