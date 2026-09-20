-- Lets the accent's text colour be chosen rather than always computed.
-- Existing sites keep the computed behaviour through the "auto" default.
ALTER TABLE "SiteSetting"
  ADD COLUMN "accentForeground" TEXT NOT NULL DEFAULT 'auto';
