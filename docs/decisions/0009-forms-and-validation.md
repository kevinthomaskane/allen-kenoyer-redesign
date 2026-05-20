# ADR-0009: Forms & validation

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

The site has two distinct categories of forms:

- **Public-site forms** — contact form, custom-design inquiry, repair inquiry, newsletter signup. Low-traffic, low-stakes, all destined for delivery to the studio (mechanism TBD in [ADR-0010](#)).
- **Admin forms** — login ([ADR-0006](./0006-authentication.md)), class editor (12+ fields per [current-pages-for-kristin.txt]), bulletin editor, password reset. Higher-stakes, write to the database.

[ADR-0008](./0008-styling-and-ui-layer.md) locked shadcn/ui as the component primitives layer, and shadcn ships a `<Form>` component that's a thin wrapper around React Hook Form + Zod. That makes the conventional pairing the path of least resistance, but not automatic.

This ADR covers the **form-building layer only**: validation schemas, form state management, and field-component composition. The **submission pipeline** (Server Actions vs third-party form services, email delivery, etc.) is [ADR-0010](#).

## Options considered

### Validation library
- **Zod** — de facto standard for TypeScript schema validation in 2025–2026. Type inference, runtime validation, composable schemas, integrates natively with RHF and shadcn `<Form>`.
- **Yup** — older alternative, less idiomatic in TS-first projects today.
- **Valibot** — smaller bundle than Zod, growing but less battle-tested. No specific reason to deviate here.

### Form library / pattern
- **React Hook Form + Zod + shadcn `<Form>`** — shadcn's `<Form>` is a wrapper over RHF + Zod that provides accessible `<FormField>`, `<FormLabel>`, `<FormDescription>`, `<FormMessage>` components for error display. Mature, well-documented, the conventional pick.
- **Conform + Zod** — Server-Actions-first form library, progressive enhancement, smaller community, no first-class shadcn adapter.
- **Native HTML forms + Server Actions + Zod (no client form library)** — minimalist, works without JS, more boilerplate per form for error display.

## Decision

Three bundled calls:

1. **Validation library:** Zod. All form schemas, request payloads from public forms, and admin CRUD payloads validate against Zod schemas.
2. **Form library:** React Hook Form (`react-hook-form`).
3. **Field/error UX:** shadcn's `<Form>` wrapper components — `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormDescription>`, `<FormMessage>` — for every form in the project (public site and admin alike).

**Implication:** form components are `'use client'` since RHF runs in the client. Submission *handlers* (the action invoked on submit) are Server Actions or fetch calls — to be decided per-form in [ADR-0010](#) and the dev guide.

**Schema reuse pattern:** Each form has a single Zod schema used in three places — the RHF `useForm({ resolver: zodResolver(schema) })`, the Server Action's server-side validation, and (where useful) the database row shape. Schema files live colocated with their feature (e.g., `app/admin/classes/schema.ts`) — exact path conventions are dev-guide level.

## Rationale

- **Zod is the unambiguous TS-first validation choice** in 2026. Anything else would require justification we don't have.
- **RHF + Zod + shadcn `<Form>`** is the conventional pairing, has the deepest documentation, and is the path shadcn already paves. Choosing Conform or hand-rolled native forms would mean either bypassing shadcn's `<Form>` wrappers (more work) or maintaining a custom adapter (more long-tail cost).
- **Single schema per form, reused server-side**, means we don't have validation drift between client and server. The Zod schema is the contract.
- **Client-component cost is acceptable.** Forms are interactive by nature; the loss of RSC for the form subtree is the right tradeoff for instant client-side validation feedback and field-level UX.

## Tradeoffs accepted

- **All form-containing pages have client-component subtrees.** Pages can still be Server Components at the top; only the form region opts into client rendering. Acceptable; the alternative (Conform's progressive enhancement) is a real benefit but doesn't justify giving up shadcn integration.
- **RHF requires JS to function.** A user with JS disabled can't submit forms. Acceptable for this audience (modern browsers, non-developer users); progressive enhancement is not a requirement.
- **shadcn `<Form>` is opinionated about field-error placement and accessible labeling.** Bespoke form layouts (multi-column, conditional sections) may need to break out of the wrapper conventions. Acceptable — shadcn's primitives are designed to be customized, and breaking out is straightforward when needed.
- **One more dependency (`react-hook-form`)** beyond the shadcn-installed ones. Trivial cost.

## Related decisions

- Depends on: [ADR-0008](./0008-styling-and-ui-layer.md) (shadcn provides the `<Form>` wrappers we lean on).
- Influences: [ADR-0010 — Form submission & transactional email](#) (every form's submit handler is decided there), Content modeling — classes / bulletin board (admin form schemas mirror table schemas), Login UI ([ADR-0006](./0006-authentication.md)) (login form uses this stack).
