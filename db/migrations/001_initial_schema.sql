-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapist_clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "therapist_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "therapist_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "therapist_client_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "time_zone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "therapist_client_id" UUID NOT NULL,
    "appointment_id" UUID NOT NULL,
    "topic" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activity_id" UUID NOT NULL,
    "question_text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "activity_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reflection_drafts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activity_id" UUID NOT NULL,
    "client_id" TEXT NOT NULL,
    "responses" JSONB NOT NULL DEFAULT '[]',
    "private_writing" TEXT NOT NULL DEFAULT '',
    "summary_draft" TEXT NOT NULL DEFAULT '',
    "summary_origin" TEXT NOT NULL DEFAULT 'manual',
    "version" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reflection_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sent_letters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activity_id" UUID NOT NULL,
    "appointment_id" UUID NOT NULL,
    "client_id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "approved_body" TEXT NOT NULL,
    "source_version" INTEGER NOT NULL,
    "policy_version" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sent_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "send_idempotency" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" TEXT NOT NULL,
    "activity_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "body_hash" TEXT NOT NULL,
    "letter_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "send_idempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "therapist_clients_client_id_idx" ON "therapist_clients"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "therapist_clients_therapist_id_client_id_key" ON "therapist_clients"("therapist_id", "client_id");

-- CreateIndex
CREATE INDEX "appointments_relationship_start_idx" ON "appointments"("therapist_client_id", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_id_therapist_client_id_key" ON "appointments"("id", "therapist_client_id");

-- CreateIndex
CREATE INDEX "activities_relationship_idx" ON "activities"("therapist_client_id");

-- CreateIndex
CREATE INDEX "activities_appointment_idx" ON "activities"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "activities_id_appointment_id_key" ON "activities"("id", "appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_question_position_unique" ON "activity_questions"("activity_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "activity_questions_id_activity_id_key" ON "activity_questions"("id", "activity_id");

-- CreateIndex
CREATE INDEX "reflection_drafts_client_idx" ON "reflection_drafts"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "reflection_draft_unique" ON "reflection_drafts"("activity_id", "client_id");

-- CreateIndex
CREATE INDEX "sent_letters_therapist_sent_idx" ON "sent_letters"("therapist_id", "sent_at" DESC, "id");

-- CreateIndex
CREATE INDEX "sent_letters_client_idx" ON "sent_letters"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "send_idempotency_letter_id_key" ON "send_idempotency"("letter_id");

-- CreateIndex
CREATE UNIQUE INDEX "send_idempotency_actor_id_activity_id_key_key" ON "send_idempotency"("actor_id", "activity_id", "key");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_clients" ADD CONSTRAINT "therapist_clients_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_clients" ADD CONSTRAINT "therapist_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_therapist_client_id_fkey" FOREIGN KEY ("therapist_client_id") REFERENCES "therapist_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_therapist_client_id_fkey" FOREIGN KEY ("therapist_client_id") REFERENCES "therapist_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_appointment_id_therapist_client_id_fkey" FOREIGN KEY ("appointment_id", "therapist_client_id") REFERENCES "appointments"("id", "therapist_client_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_questions" ADD CONSTRAINT "activity_questions_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflection_drafts" ADD CONSTRAINT "reflection_drafts_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflection_drafts" ADD CONSTRAINT "reflection_drafts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sent_letters" ADD CONSTRAINT "sent_letters_activity_id_appointment_id_fkey" FOREIGN KEY ("activity_id", "appointment_id") REFERENCES "activities"("id", "appointment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sent_letters" ADD CONSTRAINT "sent_letters_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sent_letters" ADD CONSTRAINT "sent_letters_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "send_idempotency" ADD CONSTRAINT "send_idempotency_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "send_idempotency" ADD CONSTRAINT "send_idempotency_letter_id_fkey" FOREIGN KEY ("letter_id") REFERENCES "sent_letters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Prevent sent letters from being modified or deleted
CREATE OR REPLACE FUNCTION prevent_sent_letter_changes()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Sent letters cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sent_letters_immutable
BEFORE UPDATE OR DELETE ON sent_letters
FOR EACH ROW
EXECUTE FUNCTION prevent_sent_letter_changes();