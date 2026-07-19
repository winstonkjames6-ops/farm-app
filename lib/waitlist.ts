import { createClient } from '@/utils/supabase/client'

// Called after a booking's status flips to cancelled/declined (trainer decline,
// parent cancel, athlete cancel) — notifies any parent still waiting for that
// exact trainer_id + session_time slot, then marks those waitlist rows notified
// so the same opening never re-notifies the same entry twice.
export async function notifyWaitlistOfOpening(trainerId: string, sessionTime: string) {
  const supabase = createClient()

  const { data: waitlistRows } = await supabase
    .from('booking_waitlist')
    .select('id, parent_id')
    .eq('trainer_id', trainerId)
    .eq('session_time', sessionTime)
    .is('notified_at', null)

  if (!waitlistRows || waitlistRows.length === 0) return

  const { data: trainerRow } = await supabase
    .from('trainers')
    .select('profile_id')
    .eq('id', trainerId)
    .single()
  const link = trainerRow?.profile_id ? `/trainer/${trainerRow.profile_id}` : null

  await supabase.from('notifications').insert(
    waitlistRows.map((w) => ({
      profile_id: w.parent_id,
      type: 'waitlist_opening',
      title: 'A spot opened up',
      body: 'A session you were waitlisted for is available again.',
      link,
    }))
  )

  await supabase
    .from('booking_waitlist')
    .update({ notified_at: new Date().toISOString() })
    .in('id', waitlistRows.map((w) => w.id))
}
