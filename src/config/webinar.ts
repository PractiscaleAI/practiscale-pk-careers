/** Event details and verified destinations for the /virtual-assistent page. */
export const webinar = {
  DATE: undefined as string | undefined,
  TIME: undefined as string | undefined,
  REGISTRATION_CLOSES_AT: undefined as string | undefined,
  VSL_URL: undefined as string | undefined,
  FORM_ENDPOINT: undefined as string | undefined,
  WHATSAPP_GROUP_URL: undefined as string | undefined,
  SEATS_TAKEN: undefined as number | undefined,
  LINKEDIN_COMPANY_URL: undefined as string | undefined,
  TRUSTPILOT_URL: undefined as string | undefined,
  PRIVACY_URL: undefined as string | undefined,
  LINKEDIN_KANWAL: undefined as string | undefined,
  LINKEDIN_MAHNOOR: undefined as string | undefined,
  LINKEDIN_NAYAB: undefined as string | undefined,
} as const;

export const webinarDate = webinar.DATE ?? "Date to be announced";
export const webinarTime = webinar.TIME ?? "Time to be announced";
