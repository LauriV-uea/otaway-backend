CREATE TABLE IF NOT EXISTS "tourist_places" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(255),
    "image_url" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tourist_places_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tourist_places_status_idx" ON "tourist_places"("status");