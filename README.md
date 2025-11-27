# Timewave Radio Website

A comprehensive radio station website built with Next.js 16, featuring live broadcasting detection, user authentication, and admin/staff portals.

## Features

- **Live Now Playing**: Real-time display of currently playing songs with album artwork from AzuraCast and iTunes APIs
- **User Registration**: Open registration with email verification via SMTP
- **Newsletter System**: Users can opt-in to newsletters, manageable from admin portal
- **Admin Portal**: Separate admin interface with user management, role assignments, and newsletter tools
- **Staff Portal**: Dedicated portal for presenters with encoder credentials, profile management, and broadcast history
- **Live Detection**: Automatic detection of live broadcasts with presenter profiles displayed on main site
- **Role-Based Access**: Four role levels (user, staff, admin, super_admin) with appropriate permissions

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

\`\`\`env
# Database
DB_HOST=liamradford.me
DB_USER=liamradf_timewaveradio
DB_NAME=liamradf_timewaveradio
DB_PASSWORD=your_password

# JWT
JWT_SECRET=generate_random_string

# SMTP
SMTP_HOST=your_smtp_server
SMTP_PORT=587
SMTP_USER=website@timewave.uk
SMTP_PASSWORD=your_smtp_password

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# AzuraCast
AZURACAST_API_KEY=your_api_key

# Cron
CRON_SECRET=generate_random_string
\`\`\`

## Database Setup

1. Run the SQL script in `scripts/01-create-tables.sql` on your MySQL database
2. The script creates all necessary tables for users, encoders, sessions, and newsletters

## Live Detection

The system uses a Vercel Cron Job to check for live broadcasts every minute:
- Polls AzuraCast API to detect active streamers
- Automatically creates/updates live session records
- Displays live presenter on homepage and presenter pages
- Tracks peak listeners and broadcast duration

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run database migration
4. Start dev server: `npm run dev`

## Deployment

This project is optimized for Vercel deployment:
- Automatic cron job setup via `vercel.json`
- Environment variables configured in Vercel dashboard
- MySQL database connection pooling for serverless

## Admin Access

Create the first super admin by directly inserting into the database:

\`\`\`sql
UPDATE users SET role = 'super_admin' WHERE email = 'youremail@example.com';
\`\`\`

From there, you can promote other users via the admin portal.
