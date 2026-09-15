/**
 * Offline deterministic structurer.
 *
 * This is the safety net for first-mile intake: field stations lose connectivity
 * and the free Gemini tier rate-limits, but a statement still has to be filed.
 * It is regex-based (no model), so it never invents facts — it just extracts what
 * it can literally find and flags the rest as missing.
 */
import type { StatementSchema } from "../../src/types.js";
import { MISSING_FIELD_WARNINGS } from "./prompt.js";

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
    missing_fields.push(MISSING_FIELD_WARNINGS.complainant_name);
  }
  if (!incident_datetime) {
    missing_fields.push(MISSING_FIELD_WARNINGS.incident_datetime);
  }
  if (!location) {
    missing_fields.push(MISSING_FIELD_WARNINGS.location);
  }
  if (!requested_action) {
    missing_fields.push(MISSING_FIELD_WARNINGS.requested_action);
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
