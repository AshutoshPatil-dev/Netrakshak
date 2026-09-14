# Netrakshak · Criminal Network Analysis & Tactical Command Centre

An advanced intelligence and criminal network linkage analysis platform designed for Indian law enforcement, cyber cells, and state police intelligence directorates. Built for multi-source data fusion across NCRB-style First Information Reports (FIRs), Call Detail Records (CDR), financial transaction trails, and syndicate relationships.

---

## Tech Stack

### Frontend & UI Architecture
- **Core**: Vanilla JavaScript (ES2022+ Modules) without heavy framework overhead for maximum performance and low-latency rendering.
- **Build Tool**: [Vite 7](https://vitejs.dev/) with optimized production bundling and asset hashing.
- **Styling**: Tailored Vanilla CSS design system featuring dark tactical command aesthetics, glassmorphism, HUD telemetry overlays, and responsive mobile-to-4K scaling.
- **Typography & Icons**: Inter / Outfit typography, procedural SVG tactical icons, and procedural avatar badges.
- **Localization (i18n)**: Native client-side multilingual translation engine supporting **English**, **Marathi (मराठी)**, and **Hindi (हिन्दी)**.

### Graph Analytics & Geospatial Intelligence
- **Graph Visualization**: [Sigma.js v2](https://www.sigmajs.org/) with WebGL-accelerated canvas rendering for high-density node graphs.
- **Graph Topology & Algorithms**: [Graphology](https://graphology.github.io/) supporting force-directed layout computation, Louvain community detection, degree centrality, and bridge/articulation point identification.
- **Geospatial Mapping**: [Leaflet](https://leafletjs.com/) integrated with ESRI World Imagery High-Resolution Satellite tiles.
- **Tactical Map Features**: Interactive tactical pins, coordinate search, Maharashtra district presets, marker grouping with stacked cluster cards, pin locking, and multi-edge drag repositioning.

### Backend, Database & Storage
- **Database Engine**: [Supabase](https://supabase.com/) PostgreSQL 15+ with strict schema design, foreign keys, and indexes.
- **Authentication**: Supabase Auth with JWT session management, bcrypt password hashing, and 1:1 linked officer profiles.
- **Access Control & Security**: Granular PostgreSQL Row Level Security (RLS), custom `SECURITY DEFINER` routines with isolated search paths, and database anti-privilege escalation triggers.
- **Digital Evidence Storage**: Supabase Storage private buckets (`fir-evidence`) with path-level RLS folder access.

### Cryptography & Security
- **Digital Integrity**: Client-side Web Crypto API generating immutable SHA-256 hashes for evidence verification and tamper-evident audit logging.
- **Defense in Depth**: Sanitized Leaflet map marker rendering to prevent DOM XSS, admin-guarded account management, and zero exposed server secrets.

### Hosting & Deployment
- **Platform**: [Cloudflare Pages](https://pages.cloudflare.com/) with automated CI/CD builds, `_redirects` SPA fallback, and security headers (`_headers`).

---

## Key Features

### 1. Interactive Tactical Network Graph & Satellite Mode
- **Dual View Modes**: Switch seamlessly between a high-density force-directed relationship graph and an interactive real-world satellite map.
- **Investigation Exploration Engine**: Start from any suspect or case seed node and expand connections dynamically (1-hop, 2-hop, 3-hop).
- **Tactical Pin Controls**: Lock pins in place, drag connected multi-edge clusters smoothly, and group pins into compact stacked cluster cards.
- **Global Search & Presets**: Rapidly jump across Maharashtra police zones (Pune, Mumbai, Nagpur, Thane, Nashik, Chhatrapati Sambhajinagar) or enter custom GPS coordinates.

### 2. Pure Live Database Integration
- **Zero Mock Fallbacks**: Operates exclusively against live PostgreSQL database tables.
- **Real-Time Data Sync**: Automatically hydrates entities, relationships, FIR cases, CDR records, financial logs, and officer profiles upon sign-in.
- **Dynamic Procedural Badges**: Procedurally computes suspect avatar rings and risk indicators based on live database attributes.

### 3. FIR Intake & Evidence Chain of Custody
- **Case Dossier Management**: Structured ingestion of FIRs with police station metadata, IPC / BNS legal sections, incident summaries, and accused linking.
- **SHA-256 Fingerprinting**: Computes cryptographic hashes of scanned documents upon intake to guarantee digital chain of custody.
- **Evidence Attachment**: Upload and link forensic files, audio recordings, and suspect mugshots directly to case dossiers.

### 4. Pattern & Anomaly Detection Engine
- **Community Clustering**: Automated modularity clustering to identify isolated crime syndicates and hawala rings.
- **Bridge Node Identification**: Flags key coordinators and cross-gang intermediaries bridging distinct criminal networks.
- **High Centrality Alerts**: Highlights ringleaders possessing disproportionately high connection volumes.

### 5. Multi-Tiered Role-Based Access Control (RBAC)
- **Admin**: Full authority to provision officer accounts, manage district assignments, assign roles, and administer system configuration.
- **Case Officer**: Lead investigator authority to create/edit assigned FIR cases, map suspect entities, and log intelligence.
- **Analyst**: Intelligence analysis access focused on anomaly discovery, CDR filtering, and transaction link analysis.

---

## Project Structure

```text
crime-network-command/
├── public/                     # Static assets, headers, redirects
│   ├── _headers                # Cloudflare Pages security headers
│   └── _redirects              # SPA routing rewrite rules
├── src/
│   ├── components/             # Reusable UI components (AppShell, Sidebar, Modals, Toast)
│   ├── i18n/                   # Multilingual translation dictionaries (EN, MR, HI)
│   ├── lib/                    # Core utilities (Supabase client, DOM builders, avatars)
│   ├── styles/                 # Modular CSS stylesheets (layout, views, typography)
│   ├── views/                  # Primary application views
│   │   ├── AIAnalysisView.js           # AI investigation & heuristic query workspace
│   │   ├── DashboardView.js            # Central command overview & high-risk metrics
│   │   ├── EntitiesView.js             # Suspect and organization directory
│   │   ├── EntityProfileView.js        # Detailed suspect dossier & connection drilldown
│   │   ├── FIRView.js                  # FIR case intake, dossier management & evidence
│   │   ├── LoginView.js                # Secure investigator authentication
│   │   ├── NetworkGraphView.js         # Tactical satellite & force-directed network graph
│   │   ├── OfficersView.js             # Officer roster & admin provisioning console
│   │   └── PatternsAnomaliesView.js    # Graph analytics, syndicates & anomaly detection
│   ├── main.js                 # Application entry point and view router
│   └── state.js                # Global reactive state manager and Supabase sync
├── supabase/
│   ├── migrations/             # Applied database schema migrations
│   ├── seed.sql                # Reference seed dataset
│   └── PROJECT_CONFIGURATION.sql # Single source of truth configuration reference
├── index.html                  # HTML5 shell entry
├── package.json                # Project dependencies and npm scripts
└── vite.config.js              # Vite bundler configuration
```

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- Active [Supabase](https://supabase.com/) project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AshutoshPatil-dev/Netrakshak.git
   cd Netrakshak
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional if default fallback is active):
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials to `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## Database & Security Architecture Reference

For detailed database schema specifications, table structures, column types, RLS policies, trigger routines, and security constraints, refer to the authoritative project reference document:

- **[supabase/PROJECT_CONFIGURATION.sql](supabase/PROJECT_CONFIGURATION.sql)**

---

## Security Guidelines

- **Zero Secret Exposure**: Never commit or expose Supabase `service_role` keys, database passwords, or JWT secrets in client code.
- **Backend-Enforced Authorization**: Frontend role checks are UI conveniences only; all privilege boundaries are enforced at the PostgreSQL database layer via RLS and `SECURITY DEFINER` guards.
- **Mandatory Account Passwords**: All officer accounts require explicit passwords meeting security complexity rules.

---

## License

This project is developed for the Smart India Hackathon (SIH) and Indian law enforcement intelligence modernization. Distributed under the MIT License.
