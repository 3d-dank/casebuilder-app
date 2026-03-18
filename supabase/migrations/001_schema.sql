CREATE TABLE medical_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  specialty TEXT,
  clinic TEXT,
  phone TEXT,
  address TEXT,
  dates_of_treatment TEXT,
  notes TEXT
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  doc_date TEXT,
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT
);

CREATE TABLE symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  log_date TEXT NOT NULL,
  category TEXT NOT NULL,
  symptom TEXT NOT NULL,
  severity INTEGER,
  description TEXT
);

CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  dose TEXT,
  frequency TEXT,
  prescribing_doctor TEXT,
  start_date TEXT,
  end_date TEXT,
  is_current BOOLEAN DEFAULT TRUE,
  side_effects TEXT,
  notes TEXT
);

CREATE TABLE form_data (
  id TEXT PRIMARY KEY,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB NOT NULL
);

CREATE TABLE case_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1
);

-- Disable RLS on all tables (private app)
ALTER TABLE medical_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE form_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_summaries DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
