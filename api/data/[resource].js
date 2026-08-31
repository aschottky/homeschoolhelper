import { pool, withTransaction } from '../_lib/db.js'
import { json, httpError, handle } from '../_lib/json.js'
import { requireUser } from '../_lib/session.js'

// Authenticated CRUD for the signed-in user's data.
// Resources: bootstrap, profile, children, subjects, hour-logs, samples,
// read-alouds, schedules, schedule-breaks, lesson-completions
// All rows are returned snake_case, exactly as Postgres emits them.

// Date columns are cast to 'YYYY-MM-DD' text in scheduler queries: pg returns
// bare `date` columns as local-midnight Date objects, which shift a day when
// serialized to UTC ISO strings in some timezones.
const SCHEDULE_COLS = `id, child_id, subject_id, title, days_of_week,
  start_date::text, end_date::text, start_lesson, lessons_per_session, total_lessons, created_at`
const BREAK_COLS = 'id, user_id, name, start_date::text, end_date::text, created_at'
const COMPLETION_COLS = 'id, schedule_id, lesson_number, completed_on::text, created_at'

const PROFILE_FIELDS = [
  'homeschool_name', 'parent_name', 'address', 'city',
  'state', 'zip', 'phone', 'email', 'guardians',
]

function getResource(request) {
  const url = new URL(request.url)
  const resource = decodeURIComponent(url.pathname.replace(/\/+$/, '').split('/').pop())
  return { url, resource }
}

async function ownChild(userId, childId) {
  const { rows } = await pool.query(
    'select id from children where id = $1 and user_id = $2',
    [childId, userId]
  )
  if (!rows[0]) throw httpError(404, 'Child not found')
}

async function getProfile(userId, email) {
  const { rows } = await pool.query('select * from profiles where id = $1', [userId])
  if (rows[0]) return rows[0]
  const inserted = await pool.query(
    'insert into profiles (id, email) values ($1, $2) on conflict (id) do nothing returning *',
    [userId, email]
  )
  if (inserted.rows[0]) return inserted.rows[0]
  const again = await pool.query('select * from profiles where id = $1', [userId])
  return again.rows[0]
}

export async function GET(request) {
  return handle(async () => {
    const user = await requireUser(request)
    const { resource } = getResource(request)

    if (resource === 'profile') {
      return json(await getProfile(user.id, user.email))
    }

    if (resource === 'bootstrap') {
      const { rows: children } = await pool.query(
        'select * from children where user_id = $1 order by created_at asc',
        [user.id]
      )
      const childIds = children.map((c) => c.id)
      let subjects = []
      let hourLogs = []
      let readAlouds = []
      let samples = []
      let schedules = []
      let completions = []
      if (childIds.length > 0) {
        const [s, h, r, w, sch, comp] = await Promise.all([
          pool.query('select * from subjects where child_id = any($1) order by created_at asc', [childIds]),
          pool.query('select * from hour_logs where child_id = any($1) order by date desc', [childIds]),
          pool.query('select * from read_aloud_logs where child_id = any($1)', [childIds]),
          pool.query('select * from schoolwork_samples where child_id = any($1) order by uploaded_at desc', [childIds]),
          pool.query(`select ${SCHEDULE_COLS} from schedules where child_id = any($1)`, [childIds]),
          pool.query(`select ${COMPLETION_COLS} from lesson_completions
                        where schedule_id in (select id from schedules where child_id = any($1))`, [childIds]),
        ])
        subjects = s.rows
        hourLogs = h.rows
        readAlouds = r.rows
        samples = w.rows
        schedules = sch.rows
        completions = comp.rows
      }
      const { rows: breaks } = await pool.query(
        `select ${BREAK_COLS} from schedule_breaks where user_id = $1 order by start_date asc`,
        [user.id]
      )
      return json({
        children: children.map((c) => ({
          ...c,
          subjects: subjects.filter((s) => s.child_id === c.id),
        })),
        hour_logs: hourLogs,
        read_aloud_logs: readAlouds,
        schoolwork_samples: samples,
        schedules,
        schedule_breaks: breaks,
        lesson_completions: completions,
      })
    }

    throw httpError(404, 'Unknown resource')
  })
}

export async function POST(request) {
  return handle(async () => {
    const user = await requireUser(request)
    const { resource } = getResource(request)
    const body = await request.json()

    if (resource === 'children') {
      const { name, color, state_code, birth_date, grade_level, subjects = [] } = body
      if (!name) throw httpError(400, 'Name is required')
      return json(
        await withTransaction(async (client) => {
          const { rows: [child] } = await client.query(
            `insert into children (user_id, name, color, state_code, birth_date, grade_level)
             values ($1, $2, $3, $4, $5, $6) returning *`,
            [user.id, name, color || '#8FB39A', state_code || null, birth_date || null, grade_level || null]
          )
          const insertedSubjects = []
          for (const s of subjects) {
            const { rows: [row] } = await client.query(
              `insert into subjects (child_id, name, required_hours, color, schoolwork_reminder_frequency)
               values ($1, $2, $3, $4, $5) returning *`,
              [child.id, s.name, s.required_hours || 0, s.color || '#8FB39A', s.schoolwork_reminder_frequency || null]
            )
            insertedSubjects.push(row)
          }
          return { child, subjects: insertedSubjects }
        })
      )
    }

    if (resource === 'subjects') {
      const { child_id, name, required_hours, color, schoolwork_reminder_frequency } = body
      if (!child_id || !name) throw httpError(400, 'child_id and name are required')
      await ownChild(user.id, child_id)
      const { rows: [row] } = await pool.query(
        `insert into subjects (child_id, name, required_hours, color, schoolwork_reminder_frequency)
         values ($1, $2, $3, $4, $5) returning *`,
        [child_id, name, required_hours || 0, color || '#8FB39A', schoolwork_reminder_frequency || null]
      )
      return json(row)
    }

    if (resource === 'hour-logs') {
      const { child_id, subject_id, hours, date, notes } = body
      if (!child_id || !subject_id || hours == null || !date) {
        throw httpError(400, 'child_id, subject_id, hours and date are required')
      }
      await ownChild(user.id, child_id)
      const { rows: [row] } = await pool.query(
        `insert into hour_logs (child_id, subject_id, hours, date, notes)
         values ($1, $2, $3, $4, $5) returning *`,
        [child_id, subject_id, hours, date, notes || null]
      )
      return json(row)
    }

    if (resource === 'samples') {
      const { child_id, subject_id, image_url, file_name, file_size, notes } = body
      if (!child_id || !subject_id || !image_url) {
        throw httpError(400, 'child_id, subject_id and image_url are required')
      }
      await ownChild(user.id, child_id)
      const { rows: [row] } = await pool.query(
        `insert into schoolwork_samples (child_id, subject_id, image_url, file_name, file_size, notes)
         values ($1, $2, $3, $4, $5, $6) returning *`,
        [child_id, subject_id, image_url, file_name || null, file_size || null, notes || null]
      )
      return json(row)
    }

    // Create-or-replace a subject's schedule (one schedule per subject).
    if (resource === 'schedules') {
      const {
        child_id, subject_id, title, days_of_week,
        start_date, end_date, start_lesson, lessons_per_session, total_lessons,
      } = body
      if (!child_id || !subject_id || !start_date || !end_date) {
        throw httpError(400, 'child_id, subject_id, start_date and end_date are required')
      }
      if (!Array.isArray(days_of_week) || days_of_week.length === 0
          || days_of_week.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
        throw httpError(400, 'days_of_week must be a non-empty array of 0-6')
      }
      await ownChild(user.id, child_id)
      const { rows: [subj] } = await pool.query(
        'select id from subjects where id = $1 and child_id = $2', [subject_id, child_id]
      )
      if (!subj) throw httpError(404, 'Subject not found')
      const { rows: [row] } = await pool.query(
        `insert into schedules
           (child_id, subject_id, title, days_of_week, start_date, end_date,
            start_lesson, lessons_per_session, total_lessons)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         on conflict (subject_id) do update set
           title = excluded.title,
           days_of_week = excluded.days_of_week,
           start_date = excluded.start_date,
           end_date = excluded.end_date,
           start_lesson = excluded.start_lesson,
           lessons_per_session = excluded.lessons_per_session,
           total_lessons = excluded.total_lessons,
           updated_at = now()
         returning ${SCHEDULE_COLS}`,
        [child_id, subject_id, title || null, days_of_week, start_date, end_date,
         start_lesson || 1, lessons_per_session || 1, total_lessons || null]
      )
      return json(row)
    }

    if (resource === 'schedule-breaks') {
      const { name, start_date, end_date } = body
      if (!name || !start_date || !end_date) {
        throw httpError(400, 'name, start_date and end_date are required')
      }
      const { rows: [row] } = await pool.query(
        `insert into schedule_breaks (user_id, name, start_date, end_date)
         values ($1, $2, $3, $4) returning ${BREAK_COLS}`,
        [user.id, name, start_date, end_date]
      )
      return json(row)
    }

    if (resource === 'lesson-completions') {
      const { schedule_id, lesson_number, completed_on } = body
      if (!schedule_id || !Number.isInteger(lesson_number) || !completed_on) {
        throw httpError(400, 'schedule_id, lesson_number and completed_on are required')
      }
      const { rows: [owned] } = await pool.query(
        `select s.id from schedules s
           join children c on c.id = s.child_id
          where s.id = $1 and c.user_id = $2`,
        [schedule_id, user.id]
      )
      if (!owned) throw httpError(404, 'Schedule not found')
      const { rows: [row] } = await pool.query(
        `insert into lesson_completions (schedule_id, lesson_number, completed_on)
         values ($1, $2, $3)
         on conflict (schedule_id, lesson_number) do update set completed_on = excluded.completed_on
         returning ${COMPLETION_COLS}`,
        [schedule_id, lesson_number, completed_on]
      )
      return json(row)
    }

    if (resource === 'read-alouds') {
      const { child_id, book_id, book_title, book_author, status, completed, completed_at, notes } = body
      if (!child_id || !book_title) throw httpError(400, 'child_id and book_title are required')
      await ownChild(user.id, child_id)
      const { rows: [row] } = await pool.query(
        `insert into read_aloud_logs (child_id, book_id, book_title, book_author, status, completed, completed_at, notes)
         values ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
        [child_id, book_id || null, book_title, book_author || null,
         status || 'completed', completed ?? false, completed_at || null, notes || null]
      )
      return json(row)
    }

    throw httpError(404, 'Unknown resource')
  })
}

export async function PATCH(request) {
  return handle(async () => {
    const user = await requireUser(request)
    const { url, resource } = getResource(request)
    const id = url.searchParams.get('id')
    const body = await request.json()

    if (resource === 'profile') {
      const updates = {}
      for (const field of PROFILE_FIELDS) {
        if (field in body) updates[field] = body[field]
      }
      // Users may only ever self-downgrade; premium is granted by Stripe endpoints.
      if (body.subscription_tier === 'free') updates.subscription_tier = 'free'
      await getProfile(user.id, user.email)
      const keys = Object.keys(updates)
      if (keys.length === 0) {
        return json(await getProfile(user.id, user.email))
      }
      const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
      const values = keys.map((k) => (k === 'guardians' ? JSON.stringify(updates[k]) : updates[k]))
      const { rows: [row] } = await pool.query(
        `update profiles set ${sets}, updated_at = now() where id = $1 returning *`,
        [user.id, ...values]
      )
      return json(row)
    }

    if (!id) throw httpError(400, 'id is required')

    if (resource === 'children') {
      const allowed = ['name', 'color', 'state_code', 'birth_date', 'grade_level']
      const keys = allowed.filter((k) => k in body)
      if (keys.length === 0) throw httpError(400, 'No valid fields to update')
      const sets = keys.map((k, i) => `${k} = $${i + 3}`).join(', ')
      const { rows: [row] } = await pool.query(
        `update children set ${sets}, updated_at = now() where id = $1 and user_id = $2 returning *`,
        [id, user.id, ...keys.map((k) => body[k] ?? null)]
      )
      if (!row) throw httpError(404, 'Child not found')
      return json(row)
    }

    if (resource === 'subjects') {
      const allowed = ['name', 'required_hours', 'color', 'schoolwork_reminder_frequency']
      const keys = allowed.filter((k) => k in body)
      if (keys.length === 0) throw httpError(400, 'No valid fields to update')
      const sets = keys.map((k, i) => `${k} = $${i + 3}`).join(', ')
      const { rows: [row] } = await pool.query(
        `update subjects set ${sets} where id = $1
           and child_id in (select id from children where user_id = $2) returning *`,
        [id, user.id, ...keys.map((k) => body[k] ?? null)]
      )
      if (!row) throw httpError(404, 'Subject not found')
      return json(row)
    }

    if (resource === 'read-alouds') {
      const allowed = ['book_title', 'book_author', 'status', 'completed', 'completed_at', 'notes']
      const keys = allowed.filter((k) => k in body)
      if (keys.length === 0) throw httpError(400, 'No valid fields to update')
      const sets = keys.map((k, i) => `${k} = $${i + 3}`).join(', ')
      const { rows: [row] } = await pool.query(
        `update read_aloud_logs set ${sets} where id = $1
           and child_id in (select id from children where user_id = $2) returning *`,
        [id, user.id, ...keys.map((k) => body[k] ?? null)]
      )
      if (!row) throw httpError(404, 'Read-aloud log not found')
      return json(row)
    }

    throw httpError(404, 'Unknown resource')
  })
}

// PUT /api/data/subjects?child_id= — replace all subjects for a child
export async function PUT(request) {
  return handle(async () => {
    const user = await requireUser(request)
    const { url, resource } = getResource(request)

    if (resource === 'subjects') {
      const childId = url.searchParams.get('child_id')
      if (!childId) throw httpError(400, 'child_id is required')
      await ownChild(user.id, childId)
      const { subjects = [], state_code } = await request.json()
      return json(
        await withTransaction(async (client) => {
          if (state_code !== undefined) {
            await client.query('update children set state_code = $1, updated_at = now() where id = $2', [state_code, childId])
          }
          await client.query('delete from subjects where child_id = $1', [childId])
          const inserted = []
          for (const s of subjects) {
            const { rows: [row] } = await client.query(
              `insert into subjects (child_id, name, required_hours, color, schoolwork_reminder_frequency)
               values ($1, $2, $3, $4, $5) returning *`,
              [childId, s.name, s.required_hours || 0, s.color || '#8FB39A', s.schoolwork_reminder_frequency || null]
            )
            inserted.push(row)
          }
          return { subjects: inserted }
        })
      )
    }

    throw httpError(404, 'Unknown resource')
  })
}

export async function DELETE(request) {
  return handle(async () => {
    const user = await requireUser(request)
    const { url, resource } = getResource(request)
    const id = url.searchParams.get('id')
    if (!id) throw httpError(400, 'id is required')

    if (resource === 'children') {
      const { rowCount } = await pool.query(
        'delete from children where id = $1 and user_id = $2',
        [id, user.id]
      )
      if (!rowCount) throw httpError(404, 'Child not found')
      return json({ ok: true })
    }

    if (resource === 'schedule-breaks') {
      const { rowCount } = await pool.query(
        'delete from schedule_breaks where id = $1 and user_id = $2',
        [id, user.id]
      )
      if (!rowCount) throw httpError(404, 'Break not found')
      return json({ ok: true })
    }

    if (resource === 'lesson-completions') {
      const { rowCount } = await pool.query(
        `delete from lesson_completions where id = $1
           and schedule_id in (
             select s.id from schedules s
               join children c on c.id = s.child_id
              where c.user_id = $2
           )`,
        [id, user.id]
      )
      if (!rowCount) throw httpError(404, 'Not found')
      return json({ ok: true })
    }

    const tables = {
      'subjects': 'subjects',
      'hour-logs': 'hour_logs',
      'samples': 'schoolwork_samples',
      'read-alouds': 'read_aloud_logs',
      'schedules': 'schedules',
    }
    const table = tables[resource]
    if (!table) throw httpError(404, 'Unknown resource')

    const { rowCount } = await pool.query(
      `delete from ${table} where id = $1
         and child_id in (select id from children where user_id = $2)`,
      [id, user.id]
    )
    if (!rowCount) throw httpError(404, 'Not found')
    return json({ ok: true })
  })
}
