Next: FRONTEND-ARCHITECTURE.md.

This is the bridge between the documentation we've completed and the actual frontend/ folder. It tells an AI/developer how the FrontDesk frontend must be structured, so different coding agents don't create conflicting architectures.

Create:

FrontDesk/
└── documentation/
    └── FRONTEND-ARCHITECTURE.md

It should define:

React + TypeScript
        ↓
App Router / routing
        ↓
Layouts
        ↓
Pages
        ↓
Feature modules
        ↓
Reusable components
        ↓
Hooks
        ↓
State management
        ↓
API client
        ↓
Backend

and cover:

frontend technology decisions
folder architecture
route architecture
layouts
component architecture
design-system integration
state management
server/client state separation
API client
authentication state
authorization-aware UI
forms and validation
data fetching/caching
optimistic updates
error boundaries
loading states
PWA architecture
offline strategy
service worker
local storage/IndexedDB
file uploads
import UI architecture
website builder architecture
inbox architecture
Copilot architecture
AI action/approval UI
notifications
activity system
accessibility
testing
performance
security
frontend environment variables
AI coding-agent rules
v0.1 folder structure

One important architecture decision I'd lock in for FrontDesk:

frontend/
│
├── app/
│   ├── (auth)/
│   ├── (onboarding)/
│   ├── (dashboard)/
│   │   ├── business/
│   │   ├── catalog/
│   │   ├── website/
│   │   ├── inbox/
│   │   ├── copilot/
│   │   ├── activity/
│   │   └── settings/
│   │
│   └── public/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   └── feedback/
│
├── features/
│   ├── business/
│   ├── importer/
│   ├── catalog/
│   ├── website/
│   ├── inbox/
│   ├── copilot/
│   ├── approvals/
│   └── activity/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── validation/
│   ├── storage/
│   └── utils/
│
├── hooks/
├── stores/
├── types/
├── config/
└── public/

But don't start coding from this tree yet. The architecture document should first establish the rules; then we'll create the actual folder structure from it.