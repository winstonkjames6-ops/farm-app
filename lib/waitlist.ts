import { createClient } from '@/utils/supabase/client'

function formatSessionTime(sessionTime: string): string {
  const dt = new Date(sessionTime)
  const datePart = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const timePart = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${datePart} at ${timePart}`
}

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
    .select('profile_id, profiles(name)')
    .eq('id', trainerId)
    .single()
  const trainerData = trainerRow as any
  const trainerName = trainerData?.profiles?.name ?? 'Your trainer'
  const link = trainerData?.profile_id ? `/trainer/${trainerData.profile_id}` : null
  const body = `${trainerName} has an opening on ${formatSessionTime(sessionTime)}.`

  await supabase.from('notifications').insert(
    waitlistRows.map((w) => ({
      profile_id: w.parent_id,
      type: 'waitlist_slot_open',
      title: 'A spot opened up',
      body,
      link,
    }))
  )

  await supabase
    .from('booking_waitlist')
    .update({ notified_at: new Date().toISOString() })
    .in('id', waitlistRows.map((w) => w.id))
}
