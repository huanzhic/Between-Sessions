import type { PrismaClient } from "../generated/prisma/client.js";

// Answers "is this therapist actively linked to this client?" for workflow routes.
export type LinkLookup = {
  findActiveLink(therapistId: string, clientId: string): Promise<{ id: string } | null>;
  activeClientIds(therapistId: string): Promise<string[]>;
};

// Takes the client as a parameter so this module never opens a database connection on import.
export function prismaLinks(prisma: PrismaClient): LinkLookup {
  return {
    findActiveLink: (therapistId, clientId) =>
      prisma.therapistClient.findFirst({
        where: { therapistId, clientId, status: "active" },
        select: { id: true },
      }),
    activeClientIds: async (therapistId) =>
      (
        await prisma.therapistClient.findMany({
          where: { therapistId, status: "active" },
          select: { clientId: true },
        })
      ).map((link) => link.clientId),
  };
}

export type LinkRow = { id: string; therapistId: string; clientId: string; status: string };

export function inMemoryLinks(rows: LinkRow[]): LinkLookup {
  const active = rows.filter((row) => row.status === "active");
  return {
    findActiveLink: async (therapistId, clientId) => {
      const row = active.find((r) => r.therapistId === therapistId && r.clientId === clientId);
      return row ? { id: row.id } : null;
    },
    activeClientIds: async (therapistId) =>
      active.filter((r) => r.therapistId === therapistId).map((r) => r.clientId),
  };
}
