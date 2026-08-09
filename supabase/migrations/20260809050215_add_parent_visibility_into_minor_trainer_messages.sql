-- Minor-safety: parents can see messages between their minor athlete and a trainer.
-- Scope deliberately limited to trainer counterparts only (not all of the athlete's
-- messages), and on by default — not a parent-toggle preference, since this is
-- oversight infrastructure, not a content setting.

create policy "parents can view their minor athletes' trainer messages"
  on public.messages
  for select
  using (
    exists (
      select 1 from public.athletes a
      where a.parent_id = auth.uid()
        and a.is_minor = true
        and (a.profile_id = messages.sender_id or a.profile_id = messages.recipient_id)
        and exists (
          select 1 from public.trainers t
          where t.profile_id = case
            when a.profile_id = messages.sender_id then messages.recipient_id
            else messages.sender_id
          end
        )
    )
  );
