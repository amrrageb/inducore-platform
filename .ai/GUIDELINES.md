# AI Agent Development Guidelines (`.ai/GUIDELINES.md`)

AI Coding Agents working in this repository MUST follow these operational guidelines:

---

## 🚫 Prohibited Code Patterns ("Anti-Slop")

1. **No Mock Stubs in Core Files**: Never leave `// TODO: implement later` or placeholder return values in core domain or use case modules.
2. **No Monolithic Files**: Modules must not exceed 300 lines of code. Split complex logic into single-responsibility components.
3. **No Direct DB Access in UI Controllers**: Express controllers must invoke Application Use Cases, never raw SQL or Prisma/Drizzle drivers directly.
4. **No Naked Secrets**: Never hardcode API keys or database credentials. Use `.env` variables validated with Zod.

---

## 📋 Pre-Commit Verification Sequence

Before completing any task, verify that:
1. `pnpm typecheck` compiles without TypeScript errors.
2. `pnpm lint` completes cleanly across all packages.
3. All exported interfaces maintain strict JSDoc documentation.
