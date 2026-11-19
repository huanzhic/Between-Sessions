import type {
  PrivateDraft,
  SaveReflectionRequest,
} from "@between-sessions/contracts";
import type { PrismaClient } from "../generated/prisma/client.js";

type DraftErrorCode =
  | "ACTIVITY_NOT_FOUND"
  | "INVALID_QUESTION"
  | "STALE_DRAFT";

export class DraftRepositoryError extends Error {
  constructor(public readonly code: DraftErrorCode) {
    super(code);
    this.name = "DraftRepositoryError";
  }
}

function toPrivateDraft(draft: {
  activityId: string;
  answers: PrivateDraft["answers"];
  privateWriting: string;
  summaryDraft: string;
  summaryOrigin: string;
  version: number;
  updatedAt: Date;
}): PrivateDraft {
  if (
    draft.summaryOrigin !== "manual" &&
    draft.summaryOrigin !== "ai-edited"
  ) {
    throw new Error("Invalid summary origin");
  }

  return {
    activityId: draft.activityId,
    answers: draft.answers,
    privateWriting: draft.privateWriting,
    summary: {
      text: draft.summaryDraft,
      origin: draft.summaryOrigin,
    },
    version: draft.version,
    updatedAt: draft.updatedAt.toISOString(),
  };
}

export function createDraftRepository(prisma: PrismaClient) {
  async function getDraft(
    activityId: string,
    clientId: string,
  ): Promise<PrivateDraft | null> {
    const draft = await prisma.reflectionDraft.findFirst({
      where: {
        activityId,
        clientId,
        relationship: {
          clientId,
          status: "active",
        },
      },
      select: {
        activityId: true,
        privateWriting: true,
        summaryDraft: true,
        summaryOrigin: true,
        version: true,
        updatedAt: true,
        answers: {
          select: {
            questionId: true,
            text: true,
          },
        },
      },
    });

    if (!draft) {
      return null;
    }

    return toPrivateDraft(draft);
  }
  async function saveDraft(
    activityId: string,
    clientId: string,
    input: SaveReflectionRequest,
  ): Promise<PrivateDraft> {
    return prisma.$transaction(async (tx) => {
      const activity = await tx.activity.findFirst({
        where: {
          id: activityId,
          therapistClient: {
            clientId,
            status: "active",
          },
        },
        select: {
          therapistClientId: true,
          questions: {
            select: { id: true },
          },
        },
      });

      if (!activity) {
        throw new DraftRepositoryError("ACTIVITY_NOT_FOUND");
      }
      const activeRelationship = await tx.$queryRaw<{ id: string }[]>`
            SELECT id
            FROM therapist_clients
            WHERE id = ${activity.therapistClientId}::uuid
            AND client_id = ${clientId}
            AND status = 'active'
            FOR SHARE
        `;

      if (activeRelationship.length === 0) {
        throw new DraftRepositoryError("ACTIVITY_NOT_FOUND");
      }

      const questionIds = new Set(
        activity.questions.map((q) => q.id),
      );

      if (
        input.answers.some(
          (answer) => !questionIds.has(answer.questionId),
        )
      ) {
        throw new DraftRepositoryError("INVALID_QUESTION");
      }

      const existing = await tx.reflectionDraft.findUnique({
        where: {
          activityId_clientId: {
            activityId,
            clientId,
          },
        },
        select: { id: true },
      });

      const data = {
        privateWriting: input.privateWriting,
        summaryDraft: input.summary.text,
        summaryOrigin: input.summary.origin,
      };

      let draftId: string;

      if (!existing) {
        if (input.expectedVersion !== 0) {
          throw new DraftRepositoryError("STALE_DRAFT");
        }

        const created = await tx.reflectionDraft.createMany({
          data: {
            activityId,
            clientId,
            therapistClientId: activity.therapistClientId,
            ...data,
            version: 1,
          },
          skipDuplicates: true,
        });

        if (created.count !== 1) {
          throw new DraftRepositoryError("STALE_DRAFT");
        }

        const newDraft = await tx.reflectionDraft.findUniqueOrThrow({
          where: {
            activityId_clientId: {
              activityId,
              clientId,
            },
          },
          select: { id: true },
        });

        draftId = newDraft.id;
      } else {
        const updated = await tx.reflectionDraft.updateMany({
          where: {
            id: existing.id,
            version: input.expectedVersion,
          },
          data: {
            ...data,
            version: { increment: 1 },
          },
        });

        if (updated.count !== 1) {
          throw new DraftRepositoryError("STALE_DRAFT");
        }

        draftId = existing.id;
      }

      await tx.draftAnswer.deleteMany({
        where: { draftId },
      });

      if (input.answers.length > 0) {
        await tx.draftAnswer.createMany({
          data: input.answers.map((answer) => ({
            draftId,
            activityId,
            questionId: answer.questionId,
            text: answer.text,
          })),
        });
      }

      const saved = await tx.reflectionDraft.findUniqueOrThrow({
        where: { id: draftId },
        include: {
          answers: {
            select: {
              questionId: true,
              text: true,
            },
          },
        },
      });

      return toPrivateDraft(saved);
    });
  }
  return { getDraft, saveDraft };
}
