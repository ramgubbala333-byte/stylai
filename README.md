# StylAI — AI Personal Stylist Platform

A production-grade AI-powered personal styling and grooming platform for men and women. Analyzes a user's real physical appearance and delivers personalized, explainable recommendations for colors, hairstyles, beard styles, outfits, and fashion choices.

---

## Project Summary

**Problem:** People don't know which colors, hairstyles, beard styles, or clothing choices suit their actual features — skin tone, face shape, body type, hair texture. Existing apps are fragmented, generic, or inaccurate.

**Solution:** StylAI ingests a selfie, runs computer vision analysis to extract real feature data, then maps those features to a curated rule-based recommendation engine — augmented by an optional LLM layer for natural-language explanations.

---

## Architecture Overview

```
stylai/
├── apps/
│   ├── web/          # Next.js 14 frontend (App Router)
│   └── api/          # Python FastAPI backend
├── packages/
│   ├── shared-types/ # TypeScript types shared across apps
│   └── ui-kit/       # Shared React component library (future)
├── docs/             # Architecture decisions, API docs
├── scripts/          # Dev, seed, deploy scripts
└── infra/            # Docker, nginx, cloud configs
```

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, file-based routing, excellent DX, web-first MVP |
| Backend | Python FastAPI | Async, fast, typed, ideal for CV + ML workloads |
| Database | PostgreSQL | Relational, reliable, JSONB for flexible recommendation data |
| Cache | Redis | Session cache, analysis job queue |
| CV Pipeline | MediaPipe + OpenCV + Pillow | Face mesh, landmark detection, color analysis |
| Recommendations | Rule-based engine (Python) | Explainable, auditable, deterministic |
| LLM Layer | Claude API (optional) | Natural-language summaries only — not core logic |
| Storage | S3-compatible (abstracted) | Selfie + result image storage |
| Auth | JWT + refresh tokens | Stateless, scalable |
| Containerization | Docker + docker-compose | Dev parity, easy cloud deploy |

---

## MVP Scope

### Phase 1 (This codebase)
- [ ] User registration and authentication
- [ ] Selfie upload with client-side preview
- [ ] Face shape detection (MediaPipe face mesh + geometric analysis)
- [ ] Skin tone + undertone analysis (Lab color space)
- [ ] Basic hair type analysis (texture, density estimate)
- [ ] Beard growth pattern analysis (men)
- [ ] Personalized color palette recommendations
- [ ] Hairstyle recommendations with explainer text
- [ ] Beard style recommendations (men)
- [ ] Outfit/color direction recommendations
- [ ] Shareable result card (PDF/image export)
- [ ] User profile with saved results history

### Phase 2 (Planned)
- Body type / proportion analysis
- Neckline, fit, fabric recommendations
- Glasses and accessories suggestions
- Makeup shade guidance (women)
- Barber instruction cards

### Phase 3 (Future)
- Virtual try-on (AR overlay)
- Shopping integrations
- AI chat stylist
- Mobile app (React Native)

---

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker + Docker Compose (recommended)

### Quick Start (Docker)

```bash
# Clone the repo
git clone <repo-url>
cd stylai

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Start all services
docker compose up --build

# Frontend: http://localhost:3000
# API:      http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

**Backend:**
```bash
cd apps/api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd apps/web
npm install
npm run dev
```

---

## Key Design Principles

1. **CV and recommendations are separate modules** — vision extracts features, engine maps them to style logic. Never mix.
2. **Rule-based core, LLM narrative layer** — recommendations are deterministic and explainable. LLM only writes the summary prose.
3. **Gender-specific logic is isolated** — `MenStyleEngine` and `WomenStyleEngine` extend a common base.
4. **User profile data is separate from results** — profiles hold raw features, results hold generated recommendations.
5. **Everything is typed** — Pydantic on backend, TypeScript on frontend.

---

## API Documentation

FastAPI auto-generates interactive docs at `http://localhost:8000/docs` (Swagger) and `http://localhost:8000/redoc`.

---

## Project Status

🟢 Phase 1 MVP — In active development

---

## License

Private / Proprietary — All rights reserved.
