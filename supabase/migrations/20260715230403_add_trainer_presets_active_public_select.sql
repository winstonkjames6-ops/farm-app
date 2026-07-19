-- The public booking page (app/trainer/[slug]) needs to read a trainer's
-- active preset to generate bookable slots for anonymous visitors.
-- trainer_presets was deliberately owner-only (no public SELECT) when it was
-- first created for the trainer-side preset management UI. Rather than make
-- every saved preset public, this scopes public SELECT to just the one row
-- (if any) a trainer has actually activated via trainers.active_preset_id —
-- draft/inactive presets stay fully private.

create policy "active trainer_presets are public"
on public.trainer_presets
for select
to public
using (id in (select trainers.active_preset_id from trainers where trainers.active_preset_id is not null));
