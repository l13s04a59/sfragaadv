export type PortalSchema = {
  id: string;
  label: string;
  description: string;
};

/** Schemas / systems selectable in the maintenance portal (MVP). */
export const PORTAL_SCHEMAS: readonly PortalSchema[] = [
  {
    id: "sfragaadv",
    label: "Sfragaadv",
    description: "Advocacia — schema sfragaadv",
  },
  {
    id: "lusefin",
    label: "LuseFin",
    description: "Financeiro — schema lusefin",
  },
  {
    id: "casarotaria",
    label: "CasaRotaria",
    description: "Casa Rotaria — schema casarotaria",
  },
] as const;

export const PORTAL_SCHEMA_IDS = PORTAL_SCHEMAS.map((s) => s.id);

export function isPortalSchemaId(value: string): boolean {
  return PORTAL_SCHEMA_IDS.includes(value);
}

export function getPortalSchema(id: string): PortalSchema | undefined {
  return PORTAL_SCHEMAS.find((s) => s.id === id);
}
