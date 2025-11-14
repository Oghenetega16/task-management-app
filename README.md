# Task Manager App

A full-stack task management application built with Next.js 14 (App Router), TypeScript, Supabase, and Prisma.

## Features

- 🔐 Secure authentication with Supabase Auth (email/password)
- ✅ Create, view, and delete tasks
- 👤 User-specific task isolation
- 🎨 Clean UI with Tailwind CSS and Shadcn UI
- 📱 Responsive design

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS + Shadcn UI

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

## Setup Instructions

### 1. Clone and Install

```bash
# Create a new Next.js project
npx create-next-app@latest task-manager --typescript --tailwind --app --eslint
cd task-manager

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install prisma @prisma/client
npm install -D prisma

# Install Shadcn UI
npx shadcn-ui@latest init
# Select: Default style, Slate color, CSS variables
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to Project Settings > API
4. Copy your `Project URL` and `anon/public` key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database URL for Prisma
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

To get your DATABASE_URL:
- Go to Supabase Project Settings > Database
- Copy the connection string under "Connection string" > "URI"
- Replace `[YOUR-PASSWORD]` with your database password

### 4. Set Up Prisma

```bash
# Initialize Prisma
npx prisma init

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
task-manager/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── signup/
│   │       └── page.tsx           # Signup page
│   ├── dashboard/
│   │   └── page.tsx               # Main task dashboard
│   ├── api/
│   │   └── tasks/
│   │       └── route.ts           # Task API endpoints
│   ├── layout.tsx
│   └── page.tsx                   # Landing/redirect page
├── components/
│   ├── ui/                        # Shadcn UI components
│   ├── TaskList.tsx               # Task list component
│   └── AddTaskForm.tsx            # Add task form
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Supabase client
│   │   └── server.ts              # Supabase server client
│   └── prisma.ts                  # Prisma client
├── prisma/
│   └── schema.prisma              # Database schema
└── middleware.ts                  # Auth middleware
```

## Database Schema

The app uses a single `Task` model:

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  description String
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}
```

### Schema Design Decisions

1. **UUID for IDs**: Using UUIDs instead of auto-incrementing integers for better security and distribution
2. **userId Index**: Added index on `userId` for faster queries when filtering tasks by user
3. **Timestamps**: Both `createdAt` and `updatedAt` for audit trail
4. **No Relations**: Keeping it simple without Prisma relations since Supabase Auth manages users separately

## Implementation Notes

### Authentication Flow

1. Supabase Auth handles user registration and login
2. JWT tokens are stored in HTTP-only cookies via Supabase SSR
3. Middleware protects the `/dashboard` route
4. Unauthenticated users are redirected to `/auth/login`

### Task Management

- Tasks are created via POST to `/api/tasks`
- Tasks are fetched on the client side with user-specific filtering
- Deletion is handled via DELETE to `/api/tasks?id=<taskId>`
- All operations verify the user's authentication status

### Security Considerations

- Row-level security through userId filtering
- Server-side validation of user ownership
- HTTP-only cookies for session management
- Environment variables for sensitive credentials

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
5. Deploy!

### Post-Deployment

After deployment, update your Supabase project:
1. Go to Authentication > URL Configuration
2. Add your Vercel domain to "Site URL"
3. Add `https://your-domain.vercel.app/auth/callback` to "Redirect URLs"

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema changes to database
```

## Troubleshooting

### "Invalid `prisma.task.create()` invocation"
- Make sure you've run `npx prisma generate` and `npx prisma db push`

### Authentication not working
- Verify environment variables are set correctly
- Check Supabase project status
- Ensure redirect URLs are configured in Supabase

### Tasks not showing
- Check browser console for errors
- Verify userId is being passed correctly
- Check database with `npx prisma studio`

## Future Enhancements

- Task completion status
- Task categories/tags
- Due dates and reminders
- Task search and filtering
- Task editing functionality
- Bulk operations

## License

MIT