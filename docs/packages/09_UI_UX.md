# Package 09: UI/UX Specification (`/docs/packages/09_UI_UX.md`)

## 1. Overview
Defines design system tokens, typography scales, layout hierarchies, accessibility standards, and component libraries (`@inducore/ui-kit`).

## 2. Design Tokens & Palette
- **Primary Canvas**: Off-white / Slate neutral (`bg-slate-50`, `text-slate-800`).
- **Accent Theme**: Enterprise Emerald (`emerald-600` primary accent, `emerald-500/10` background pills).
- **Typography**: Clean sans-serif hierarchy (Inter / Plus Jakarta Sans) with crisp tabular numbers for metrics.

## 3. UI/UX "Anti-Slop" Principles
- No purple-to-blue default gradients or arbitrary glow shadows.
- No nested cards inside cards.
- Container padding math: outer padding (>=16px) >= inner element padding.
- Button horizontal padding must be 2x vertical padding.
- Labels inside controls sit on ONE line (`white-space: nowrap`).
