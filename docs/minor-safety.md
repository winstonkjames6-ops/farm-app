# Minor Safety & Consent

## Overview

FARM determines whether an athlete is a minor purely from their date of birth (`dob`), computed server-side rather than trusted from any client input. Once an athlete profile is flagged as a minor, that flag gates who they can exchange direct messages with: a minor can only message a trainer once a waiver has been signed for them (or the message is with their own parent). Consent is tracked as two distinct signals — accepting the platform's terms, and a parent/guardian's signed waiver for training — and the schema and code deliberately keep those two apart.

## `is_minor` computation

`is_minor` is never client-supplied. It is computed by a `BEFORE INSERT OR UPDATE` trigger on `public.athletes`:

- Function: `public.compute_athlete_is_minor()` — defined in [`20260726220000_add_child_invite_and_consent.sql`](../supabase/migrations/20260726220000_add_child_invite_and_consent.sql)
- Trigger: `athletes_set_is_minor` (same file), re-declared in the current baseline at [`20260805144000_baseline_schema_snapshot.sql:676-678`](../supabase/migrations/20260805144000_baseline_schema_snapshot.sql)

```sql
new.is_minor := (new.dob is null) or (new.dob > (current_date - interval '18 years'));
```

Note the `dob is null` branch: an athlete row with no birthdate on file defaults to `is_minor = true` (fail-safe, not fail-open).

A second copy of the flag lives on `public.profiles.is_minor`, added in [`20260727130000_add_profile_is_minor_flag.sql`](../supabase/migrations/20260727130000_add_profile_is_minor_flag.sql) so RLS policies that only have a `profile_id` on hand (messaging, visibility, future discover-feed gating) don't have to join into `athletes` on every check. It's kept in sync by a separate trigger, `athletes_sync_profile_is_minor` → `public.sync_profile_is_minor()`, and `authenticated` has no `UPDATE` grant on the column (`revoke update (is_minor) on public.profiles from authenticated;`) — same non-client-settable pattern as the `dob`-driven source column. This mirror is explicitly a **read convenience only**; the actual messaging enforcement point is the policy described below, not this column.

## Messaging restrictions

Minor-messaging is enforced at the RLS layer, not in the UI. The policy is `"sender creates message"` (`INSERT` policy on `public.messages`), currently defined at [`20260805144000_baseline_schema_snapshot.sql:791-800`](../supabase/migrations/20260805144000_baseline_schema_snapshot.sql):

```sql
create policy "sender creates message" on public.messages for insert
  with check (
    auth.uid() = sender_id and not exists (
      select 1 from athletes a
      where a.profile_id = any (array[messages.sender_id, messages.recipient_id])
        and a.dob is not null
        and extract(year from age(current_date::timestamptz, a.dob::timestamptz)) < 18
        and (a.parent_id is null or a.waiver_signed_at is null)
    )
  );
```

In plain terms: if either party to the message is an athlete under 18 (by `dob`), the insert is blocked unless that athlete has a `parent_id` **and** a non-null `waiver_signed_at`. The baseline file itself calls this out with the comment `-- messages (minor-safety enforcement lives in this INSERT policy's with_check)`.

**Gap in the migration history:** this policy was originally introduced by a migration named `block_minor_messaging_without_waiver`, referenced by name in the comments of both [`20260727130000_add_profile_is_minor_flag.sql`](../supabase/migrations/20260727130000_add_profile_is_minor_flag.sql) (`"...enforced by the 'sender creates message' RLS policy from block_minor_messaging_without_waiver (a dob-based check against athletes.waiver_signed_at, already live)"`) and [`20260726220000_add_child_invite_and_consent.sql`](../supabase/migrations/20260726220000_add_child_invite_and_consent.sql). **That migration file is not present in the current `supabase/migrations/` folder.** The policy it created only survives today because it was captured in the [`20260805144000_baseline_schema_snapshot.sql`](../supabase/migrations/20260805144000_baseline_schema_snapshot.sql) snapshot. The original file should be recovered — e.g. via `supabase db diff` against the remote project, or pulled from wherever it was applied from — so the repo's migration history isn't missing an authoring migration for a security-relevant policy.

## Consent tracking

Two separate consent timestamps exist and must not be conflated — this distinction is called out directly in the migration comments:

| Column | Table | Meaning |
|---|---|---|
| `terms_accepted_at` | `public.athletes` **and** `public.profiles` | Acceptance of the platform's terms of service, added by the parent-onboarding wizard's child-account creation flow. |
| `waiver_signed_at` (+ `waiver_signature`, `waiver_signed_by`) | `public.athletes` | A parent/guardian's signed liability waiver for **training**, belonging to the unrelated direct-messaging consent feature. |

From the comment in [`20260726220000_add_child_invite_and_consent.sql`](../supabase/migrations/20260726220000_add_child_invite_and_consent.sql):

> `terms_accepted_at` is a NEW column distinct from `waiver_signed_at`/`waiver_signature`/`waiver_signed_by`, which belong to the unrelated direct-messaging consent feature — do not conflate the two.

Practically: a minor athlete's `terms_accepted_at` being set says nothing about whether their parent has signed the training waiver, and only the latter (`waiver_signed_at`) is what the `"sender creates message"` policy checks before allowing a minor to be messaged by (or to message) a trainer.

`public.profiles` also carries its own `terms_accepted_at` (added in [`20260805154557_add_terms_version_columns.sql`](../supabase/migrations/20260805154557_add_terms_version_columns.sql), per the baseline snapshot) — that's the general account-level terms acceptance for any user (parent, trainer, adult athlete), separate from the athlete-row `terms_accepted_at` tied to the child-onboarding wizard.

## Open gaps

- **No parent-facing view into a minor's trainer messages.** `public.messages` RLS grants a claimed minor athlete visibility into messages where their *parent* is sender/recipient (`"athletes can view their parent's messages"`), but there is no corresponding policy letting a parent view messages where their own minor child is directly the sender/recipient. Once a minor is messaging a trainer directly (post-waiver), the parent has no DB-level read path into that conversation.
- **No moderation pipeline for minor-uploaded or minor-authored content.** `public.post_reports` and `public.comment_reports` exist for community posts/comments generally, but there's no minor-specific review queue, and no reporting/moderation table covering direct messages at all.
- **Missing migration file for the core enforcement policy.** As noted above, `block_minor_messaging_without_waiver` is referenced by name in two other migrations' comments but doesn't exist in `supabase/migrations/`; the policy only exists in the repo via the later baseline snapshot.
- **Age boundary uses two slightly different expressions.** `compute_athlete_is_minor()` uses `dob > (current_date - interval '18 years')`, while the messaging policy uses `extract(year from age(...)) < 18`. These should agree at the boundary but are two independent implementations of "under 18" rather than one shared source of truth.

## Migration files read

- `supabase/migrations/20260726220000_add_child_invite_and_consent.sql`
- `supabase/migrations/20260727120000_add_athlete_invite_claim.sql`
- `supabase/migrations/20260727130000_add_profile_is_minor_flag.sql`
- `supabase/migrations/20260805144000_baseline_schema_snapshot.sql`
