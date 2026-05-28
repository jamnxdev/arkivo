# Contributing to Arkivo

Thanks for taking the time to improve Arkivo. This document describes how to make changes in a way that is easy to review, safe for users, and consistent with the existing codebase.

## Project Principles

Arkivo handles personal financial documents, so changes should prioritize:

- Correctness over cleverness.
- Clear user feedback over silent failure.
- Typed boundaries over implicit data shapes.
- Small, reviewable changes over broad rewrites.
- Privacy-aware logging and error handling.
- Server-side enforcement for auth and data ownership.

## Before You Start

1. Read [README.md](./README.md) for product context.
2. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for local setup and architecture.
3. Open an issue or discussion for large behavior changes before implementing them.

## Good First Contributions

Good first changes are usually narrow and easy to verify:

- UI copy improvements.
- Loading, empty, error, and success states.
- Small validation fixes.
- Documentation improvements.
- Focused component cleanup.
- Tests around a single helper or endpoint.

Avoid starting with:

- Auth rewrites.
- Database schema redesigns.
- AI prompt or model changes without sample data.
- Broad styling rewrites.
- Large dependency swaps.

## Branches

Use short descriptive branch names:

```text
docs/improve-readme
fix/receipt-save-error
feat/manual-receipt-validation
refactor/analytics-cache
```

## Commit Messages

Use imperative, concise commit messages:

```text
Add receipt save success feedback
Fix category chart empty state
Document local Cloudinary setup
```

Keep unrelated work in separate commits or separate pull requests.

## Pull Request Checklist

Before opening a pull request, make sure:

- The change has a clear purpose.
- The implementation follows existing patterns.
- New user-facing behavior has loading, empty, and error states where relevant.
- New API behavior validates input and checks auth.
- Database changes include migrations.
- Documentation is updated when setup, commands, APIs, or behavior changes.
- `bun run typecheck` passes.
- `bun run lint` passes or only reports known unrelated warnings.
- `bun run build` passes when the change touches routing, metadata, server code, or configuration.

## Review Expectations

Reviewers should focus on:

- User impact.
- Data correctness.
- Auth and access control.
- Failure modes.
- Maintainability.
- Test or verification coverage.

Review comments should be specific and actionable. If suggesting a different approach, explain the tradeoff.

## Code Style

Follow the existing codebase:

- Use TypeScript.
- Prefer existing local helpers and patterns.
- Keep components small enough to understand.
- Keep API handlers explicit about validation and auth.
- Use Zod for untrusted inputs.
- Use Drizzle query helpers for database access.
- Use Tailwind utility classes in the existing style.
- Avoid unrelated formatting churn.

Run formatting when needed:

```bash
bun run format
```

## Type Safety

Avoid `any`. If data crosses a boundary, validate or type it:

- Browser to API: validate request body.
- AI output to app state: validate with Zod.
- Database rows to UI: use query return types or local DTOs.
- Optional fields: handle `null` and `undefined` intentionally.

## Auth and Security

Every API route that reads or writes user data must:

- Resolve the current user through `getCurrentUser`.
- Return an unauthorized response when there is no user.
- Set row-level security context where database queries require it.
- Scope reads and writes to the current user.

Never expose these values to the browser:

- `DATABASE_URL`
- `MIGRATION_DATABASE_URL`
- `CLERK_SECRET_KEY`
- `CLOUDINARY_API_SECRET`
- `GEMINI_API_KEY`

## AI Extraction Changes

Changes to `lib/ai/client.ts` should be made carefully. Receipt extraction mistakes can create incorrect financial records.

When changing prompts, models, or output schemas:

- Keep the response schema strict.
- Do not invent missing receipt fields.
- Preserve numeric totals as numbers.
- Keep dates in `YYYY-MM-DD` when visible.
- Include examples or screenshots in the PR when possible.
- Verify German receipt wording still works.
- Check that total normalization still behaves correctly.

## Database Changes

Schema changes should include Drizzle migrations. Do not manually edit generated migration metadata unless you know why it is necessary.

For migrations:

1. Update `lib/db/schema.ts`.
2. Generate or write the migration.
3. Run the migration locally.
4. Verify affected queries and API routes.
5. Document any required deployment order.

## UI Contributions

For UI work:

- Preserve keyboard accessibility.
- Use existing UI primitives from `components/ui`.
- Keep form feedback close to the relevant input.
- Avoid hiding API errors.
- Make mobile layouts usable.
- Keep dashboard surfaces information-dense and practical.

## Documentation Contributions

Documentation should be accurate and runnable. Prefer:

- Real commands from `package.json`.
- Actual route names.
- Actual environment variable names.
- Current implementation details.
- Clear warnings for destructive or production-impacting commands.

## Reporting Bugs

When reporting a bug, include:

- What happened.
- What you expected.
- Steps to reproduce.
- Browser and operating system if UI-related.
- Relevant logs or screenshots.
- Whether the issue happens locally, in production, or both.

Avoid posting secrets, private receipt images, or full financial data in public issues.

## License

By contributing, you agree that your contributions are licensed under the GNU Affero General Public License v3.0, the same license as this project.
