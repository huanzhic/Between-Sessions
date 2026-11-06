CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('therapist', 'client')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE therapist_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES users(id),
    client_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT therapist_client_distinct CHECK (therapist_id <> client_id),
    CONSTRAINT therapist_client_unique UNIQUE (therapist_id, client_id)
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_client_id UUID NOT NULL REFERENCES therapist_clients(id),
    starts_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_client_id UUID NOT NULL REFERENCES therapist_clients(id),
    appointment_id UUID REFERENCES appointments(id),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activity_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 1),
    CONSTRAINT activity_question_position_unique UNIQUE (activity_id, position)
);

CREATE TABLE reflection_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id),
    client_id UUID NOT NULL REFERENCES users(id),
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    summary_draft TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT reflection_draft_unique UNIQUE (activity_id, client_id),
    CONSTRAINT reflection_responses_object CHECK (jsonb_typeof(responses) = 'object')
);

CREATE TABLE sent_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id),
    client_id UUID NOT NULL REFERENCES users(id),
    therapist_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT sent_letter_nonempty CHECK (length(btrim(content)) > 0)
);

CREATE INDEX auth_sessions_user_id_idx ON auth_sessions(user_id);
CREATE INDEX therapist_clients_client_id_idx ON therapist_clients(client_id);
CREATE INDEX appointments_relationship_start_idx ON appointments(therapist_client_id, starts_at);
CREATE INDEX activities_relationship_idx ON activities(therapist_client_id);
CREATE INDEX activities_appointment_idx ON activities(appointment_id);
CREATE INDEX reflection_drafts_client_idx ON reflection_drafts(client_id);
CREATE INDEX sent_letters_therapist_sent_idx ON sent_letters(therapist_id, sent_at DESC);
CREATE INDEX sent_letters_client_idx ON sent_letters(client_id);