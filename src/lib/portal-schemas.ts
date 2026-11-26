export type PortalSchema = {
  id: string;
  label: string;
  description: string;
  /** When true, the portal page may load read-only overview data. */
  hasDataPreview: boolean;
};

/** Systems selectable in LUSEAN SISTEMAS (order matches UI). */
export const PORTAL_SCHEMAS: readonly PortalSchema[] = [
  {
    id: "casarotaria",
    label: "CASA ROTÁRIA",
    description: "Schema casarotaria — em breve",
    hasDataPreview: false,
  },
  {
    id: "sfragaadv",
    label: "SFRAGA ADVOCACIA",
    description: "Schema sfragaadv + public (prévia de dados)",
    hasDataPreview: true,
  },
  {
    id: "lusefin",
    label: "LUSEAN FINANÇAS",
    description: "Schema lusefin — em breve",
    hasDataPreview: false,
  },
] as const;

export const PORTAL_SCHEMA_IDS = PORTAL_SCHEMAS.map((s) => s.id);

export function isPortalSchemaId(value: string): boolean {
  return PORTAL_SCHEMA_IDS.includes(value);
}

export function getPortalSchema(id: string): PortalSchema | undefined {
  return PORTAL_SCHEMAS.find((s) => s.id === id);
}
