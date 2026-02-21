-- Add spaced repetition (Leitner 3-box) columns to the flashcards table.
-- Run this once against an existing database where the flashcards table
-- already exists. New deployments will get these columns automatically
-- via SQLAlchemy's create_all().

ALTER TABLE flashcards
  ADD COLUMN IF NOT EXISTS box INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS next_review TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reviewed TIMESTAMPTZ;
