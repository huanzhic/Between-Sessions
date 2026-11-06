-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL
        CHECK (role IN ('therapist', 'client')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Authentication Sessions
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Therapist-Client Relationships
CREATE TABLE therapist_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES users(id),
    client_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT therapist_client_distinct
        CHECK (therapist_id <> client_id),
    CONSTRAINT therapist_client_unique
        UNIQUE (therapist_id, client_id)
);

-- 4. Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_client_id UUID NOT NULL
        REFERENCES therapist_clients(id),
    starts_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Activities / Homework
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_client_id UUID NOT NULL
        REFERENCES therapist_clients(id),
    appointment_id UUID REFERENCES appointments(id),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Activity Questions
CREATE TABLE activity_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id)
        ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 1),
    CONSTRAINT activity_question_position_unique
        UNIQUE (activity_id, position)
);

-- 7. Private Reflection Drafts
CREATE TABLE reflection_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id),
    client_id UUID NOT NULL REFERENCES users(id),
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    summary_draft TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT reflection_draft_unique
        UNIQUE (activity_id, client_id),
    CONSTRAINT reflection_responses_object
        CHECK (jsonb_typeof(responses) = 'object')
);

-- 8. Submitted Letters
CREATE TABLE sent_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id),
    client_id UUID NOT NULL REFERENCES users(id),
    therapist_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT sent_letter_nonempty
        CHECK (length(btrim(content)) > 0)
);