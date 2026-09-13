# Netrakshak — Criminal Network Analysis

Indian-context Smart India Hackathon prototype for NCRB-style FIR and multi-source linkage analysis.

## Run

```bash
npm install
npm run dev
```

The production build is generated with `npm run build`.

## Chosen deployment storage

For the SIH prototype, the target backend is Cloudflare Workers + D1 + R2:

- **D1** stores officers, cases, entities, relationships, FIR metadata, audit events, and graph query projections.
- **R2** stores private scanned FIRs and evidence files; only hashes and metadata are stored in D1.
- **Workers** expose authenticated APIs and bounded neighborhood queries for the graph.
- **Pages** serves the frontend.

D1 is a good free-tier fit for the structured demo database, but it is SQLite-compatible and each database is single-threaded. The graph API will therefore use indexes, FTS5, bounded neighborhoods, and progressive expansion rather than returning the entire network. R2 is the file-storage companion, because it has a larger free monthly storage allowance and free egress. Production police data would require a security review, stronger identity controls, backups, retention policy, and an approved hosting posture.

## Data honesty

The browser prototype uses clearly labelled synthetic Indian-context records. Public NCRB catalogues are predominantly aggregate and do not provide a case-level suspect graph. The production ingestion adapters are designed for the authoritative SIH dataset specification when supplied.

The FIR screen computes a real SHA-256 fingerprint locally. OCR, persistence, authentication, and ledger anchoring are explicit integration points and are not faked in this prototype.

## Planned adapters

- NCRB/Open Government Data catalogue references
- Synthetic FIR/entity fixtures for development
- IBM AMLSim for transaction-network testing
- Elliptic Bitcoin dataset for blockchain tracing research
- CIC-IDS2017 / UNSW-NB15 for cyber anomaly experiments
- STIX/TAXII and MITRE ATT&CK for cyber threat intelligence mapping
