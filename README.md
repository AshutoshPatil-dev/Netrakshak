# Netrakshak · Criminal Network Analysis

Indian-context Smart India Hackathon prototype for NCRB-style FIR and multi-source linkage analysis.

## Run

```bash
npm install
npm run dev
```

The production build is generated with `npm run build`.

## Supabase setup

The current prototype uses Supabase Auth and PostgreSQL as the backend path:

1. Copy `.env.example` to `.env` and add `VITE_SUPABASE_URL` plus `VITE_SUPABASE_ANON_KEY`.
2. Run `supabase/migrations/0001_initial.sql` in the Supabase SQL editor.
3. Create officer accounts under Authentication → Users.
4. Optionally run `supabase/seed.sql` using a privileged SQL editor session.

The migration enables RLS and uses scoped access: users can access records they created or records explicitly granted through `fir_access` / `entity_access`. Access grants are intentionally not client-writable. Use a trusted server or Edge Function to grant access. Scanned FIR files should use a private Storage bucket; store only the bucket path and SHA-256 fingerprint in `fir_cases` / `evidence_items`.

When Supabase environment variables are absent, the UI uses a clearly labelled local demo session. It is not production authentication.

## Data honesty

The browser prototype uses clearly labelled synthetic Indian-context records. Public NCRB catalogues are predominantly aggregate and do not provide a case-level suspect graph. The production ingestion adapters are designed for the authoritative SIH dataset specification when supplied.

The FIR screen computes a real SHA-256 fingerprint locally. Supabase Auth and the database schema are wired, while OCR, Storage uploads, and ledger anchoring remain explicit integration points and are not faked.

## Planned adapters

- NCRB/Open Government Data catalogue references
- Synthetic FIR/entity fixtures for development
- IBM AMLSim for transaction-network testing
- Elliptic Bitcoin dataset for blockchain tracing research
- CIC-IDS2017 / UNSW-NB15 for cyber anomaly experiments
- STIX/TAXII and MITRE ATT&CK for cyber threat intelligence mapping
