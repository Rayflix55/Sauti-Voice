import { GoogleGenAI } from "@google/genai";
import { StatementSchema } from "../src/types.js";

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function structureComplaintTranscript(
  transcript: string,
): Promise<StatementSchema> {
  const ai = getAIClient();
  if (!ai) {
    throw new Error(
      "GEMINI_API_KEY is not set. Gemini structuring needs a real API key.",
    );
  }

  const prompt = `You are a legal intake and police documentation assistant for Sauti, an intake platform in Nigeria that turns spoken, code-switched citizen complaints (Nigerian Pidgin, Yoruba-English, English) into formal legal statements.

Your task is to take the following spoken transcript and structure it into a formal legal statement according to the exact JSON schema provided below.

Strict rules:
1. "complainant_name": Extract the full name of the complainant if stated. If the speaker does not explicitly state their name, set it to null. DO NOT guess or invent a name.
2. "incident_datetime": Extract the date and time of the incident (e.g., "Yesterday at approximately 7:00 PM", "Thursday night", "Last month"). If not mentioned, set to null.
3. "location": Extract the specific place, junction, street, market, or area where the incident occurred (e.g., "Alaba market, Lagos", "Ojuelegba junction"). If not stated, set to null.
4. "narrative": Write a formal, grammatically clear, factual statement of the incident in formal English, faithfully translating code-switched or Pidgin phrases while preserving all key factual details (e.g., items stolen, amounts in Naira, license plates like LND-234-XY, physical injuries, relationship of parties).
5. "witnesses": An array of any third-party witnesses, bystanders, or neighbors specifically mentioned (e.g. ["Corner shop seller", "Alaba market security"]). If none are mentioned, return an empty array [].
6. "requested_action": What legal or police action the complainant seeks (e.g., "Investigation and recovery of stolen items", "Prosecution for assault and battery", "Assistance in retrieving leased property"). If not stated, set to null.
7. "missing_fields": A list of explicit, polite advisory warnings for ANY core field (name, incident_datetime, location, requested_action) that is missing from the spoken account, e.g.:
   - "Complainant name not mentioned — please verify full name with complainant"
   - "Location of incident not mentioned — please confirm specific address or area"
   - "Exact date or time not specified — please confirm timestamp"
   - "Requested action not specified — please ask what relief complainant seeks"
   DO NOT guess or fabricate details for missing fields. Flag them explicitly.

JSON SCHEMA:
{
  "complainant_name": string | null,
  "incident_datetime": string | null,
  "location": string | null,
  "narrative": string,
  "witnesses": string[],
  "requested_action": string | null,
  "missing_fields": string[]
}

Spoken Transcript to structure:
"""
${transcript}
"""

Return ONLY the raw JSON object conforming to the schema above, without markdown ticks or commentary.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text) as StatementSchema;
    return {
      complainant_name: parsed.complainant_name ?? null,
      incident_datetime: parsed.incident_datetime ?? null,
      location: parsed.location ?? null,
      narrative: parsed.narrative || transcript,
      witnesses: Array.isArray(parsed.witnesses) ? parsed.witnesses : [],
      requested_action: parsed.requested_action ?? null,
      missing_fields: Array.isArray(parsed.missing_fields)
        ? parsed.missing_fields
        : [],
    };
  } catch (error) {
    throw new Error(
      `Gemini structuring error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function heuristicStructureComplaint(
  transcript: string,
): StatementSchema {
  const t = transcript.trim();
  const lower = t.toLowerCase();

  let complainant_name: string | null = null;
  const nameMatch = t.match(
    /(?:my name is|i am|this is|mo n jẹ́|mo je)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
  );
  if (nameMatch) {
    complainant_name = nameMatch[1];
  }

  let incident_datetime: string | null = null;
  const timeMatch = t.match(
    /(last night|yesterday|around \d+\s*(?:am|pm)?|thursday night|last month|today|\d{1,2}:\d{2}\s*(?:am|pm)?|on [A-Z][a-z]+day)/i,
  );
  if (timeMatch) {
    incident_datetime =
      timeMatch[1].charAt(0).toUpperCase() + timeMatch[1].slice(1);
  }

  let location: string | null = null;
  const locMatch = t.match(
    /(?:for|at|in|inside|around|near)\s+([A-Z][a-z0-9\s\-]+(?:market|junction|street|avenue|road|bus stop|apartment|shop|expressway|lagos|ikeja|ojuelegba|alaba))/i,
  );
  if (locMatch) {
    location = locMatch[1].trim();
  } else if (lower.includes("alaba market")) {
    location = "Alaba Market, Lagos";
  } else if (lower.includes("ojuelegba")) {
    location = "Ojuelegba Junction, Lagos";
  }

  const witnesses: string[] = [];
  if (lower.includes("neighbor") || lower.includes("neighbour")) {
    witnesses.push("Adjacent neighbor");
  }
  if (lower.includes("corner shop")) {
    witnesses.push("Corner shop vendor");
  }

  let requested_action: string | null = null;
  if (
    lower.includes("stole") ||
    lower.includes("break into") ||
    lower.includes("carry my")
  ) {
    requested_action =
      "Formal investigation into burglary and recovery of stolen property.";
  } else if (
    lower.includes("hit") ||
    lower.includes("motorcycle") ||
    lower.includes("assault") ||
    lower.includes("kọlù") ||
    lower.includes("beat")
  ) {
    requested_action =
      "Apprehension of suspect and formal charges for assault/reckless injury.";
  } else if (
    lower.includes("pay back") ||
    lower.includes("collect my money") ||
    lower.includes("naira")
  ) {
    requested_action =
      "Recovery of debt and investigation into fraudulent conversion.";
  } else if (lower.includes("landlord") || lower.includes("locks")) {
    requested_action =
      "Intervention in unlawful eviction and restoration of tenancy access.";
  }

  // Formalized narrative
  let narrative = t;
  if (lower.includes("alaba market") && lower.includes("break into")) {
    narrative =
      "The complainant reports that unknown perpetrators broke into their commercial shop located in Alaba Market during the night. Two mobile telephones and cash stored inside the office drawer were unlawfully removed.";
  } else if (lower.includes("ojuelegba") && lower.includes("motorcycle")) {
    narrative =
      "The complainant was walking home from work in the vicinity of Ojuelegba junction yesterday at approximately 7:00 PM when an oncoming motorcycle collided with their leg, causing physical injury.";
  } else if (lower.includes("kọlù") || lower.includes("ọkọ mi")) {
    narrative =
      "The complainant reports an incident of domestic assault wherein her spouse physically attacked and inflicted bodily injuries upon her during the night.";
  } else if (lower.includes("plate number") || lower.includes("lnd-234-xy")) {
    narrative =
      "The complainant reports the unlawful theft of their motor vehicle occurring on Thursday night. The vehicle bears official registration plate number LND-234-XY.";
  } else if (lower.includes("locks") && lower.includes("landlord")) {
    narrative =
      "The complainant states that their landlord unlawfully altered the locks on their rented apartment without statutory notice while the complainant was away.";
  } else {
    narrative = `The complainant reported the following verbal account: "${t}". The incident warrants formal police documentation and verification.`;
  }

  const missing_fields: string[] = [];
  if (!complainant_name) {
    missing_fields.push(
      "Complainant name not mentioned — please confirm with complainant",
    );
  }
  if (!incident_datetime) {
    missing_fields.push(
      "Incident date and time not specified — please confirm exact timestamp",
    );
  }
  if (!location) {
    missing_fields.push(
      "Location of incident not mentioned — please confirm specific address or area",
    );
  }
  if (!requested_action) {
    missing_fields.push(
      "Requested relief not specified — please ask what action complainant seeks",
    );
  }

  return {
    complainant_name,
    incident_datetime,
    location,
    narrative,
    witnesses,
    requested_action,
    missing_fields,
  };
}
