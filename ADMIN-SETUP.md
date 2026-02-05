# Admin Setup

## 1. Run the admin schema

In **Supabase Dashboard → SQL Editor**, run the contents of `supabase-schema-admin.sql`. This adds:

- `is_admin` on `profiles`
- `suggested_books` table (admin-managed read-aloud suggestions)
- `resources` table (admin-managed homepage resource cards)
- `status` on `read_aloud_logs` (want / reading / completed)

## 2. Make your account an admin

In **Supabase Dashboard → SQL Editor** run:

```sql
-- Replace YOUR_USER_UUID with your auth user id (from Authentication → Users, or from profiles.id)
UPDATE public.profiles SET is_admin = true WHERE id = 'YOUR_USER_UUID';
```

To find your user id: sign in to the app, then in Supabase go to **Authentication → Users** and copy the UUID of your user.

## 3. What admins can do

- **Admin** tab (in the Tracker sidebar, only visible when logged in as admin):
  - **Suggested Books**: Add, edit, and remove books from the read-aloud suggestions list. If the table is empty, the app uses the built-in list.
  - **Resources**: Add, edit, and remove homepage resource cards (category, count label, bullet items, color, link).

## 4. Premium read-aloud tracking

- **Premium** users can check off books per child (Want to Read / Currently Reading / Completed).
- Status is stored in `read_aloud_logs` and syncs across devices when signed in.
- The same suggested book list (from admin or built-in) is used for everyone; admins control which books appear in that list.
