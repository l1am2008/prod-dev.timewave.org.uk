# Timewave Radio - Ubuntu Deployment Guide

## Prerequisites

- Ubuntu server with Node.js 18+ installed
- MySQL database (your cPanel MySQL)
- PM2 installed globally
- Domain/subdomain pointing to your server

## Step 1: Install Dependencies

\`\`\`bash
# Install Node.js 18+ (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install build essentials (if needed)
sudo apt-get install -y build-essential
\`\`\`

## Step 2: Upload Project Files

Upload your project to your Ubuntu server (e.g., `~/prod-dev.timewave.org.uk`)

\`\`\`bash
# Navigate to your project directory
cd ~/prod-dev.timewave.org.uk

# Install dependencies
npm install
\`\`\`

## Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

\`\`\`bash
nano .env.local
\`\`\`

Add the following (replace with your actual values):

\`\`\`env
# Database Configuration
DB_HOST=liamradford.me
DB_USER=liamradf_timewaveradio
DB_PASSWORD=X65Im%ySloQu(BYs
DB_NAME=liamradf_timewaveradio
DB_PORT=3306

# Email Configuration (SMTP)
SMTP_HOST=mail.timewave.uk
SMTP_PORT=587
SMTP_USER=website@timewave.uk
SMTP_PASSWORD=your_email_password
SMTP_FROM=website@timewave.uk

# AzuraCast Configuration
AZURACAST_API_URL=https://admin.stream.timewave.org.uk/api
AZURACAST_API_KEY=your_azuracast_api_key
AZURACAST_STATION_ID=timewave_radio

# JWT Secret (generate a random string)
JWT_SECRET=your_very_long_random_secret_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://your-domain.com:3030

# Cron Secret (for Vercel Cron - generate random string)
CRON_SECRET=your_random_cron_secret
\`\`\`

Save and exit (Ctrl+X, Y, Enter)

## Step 4: Setup Database

Run the SQL setup script on your MySQL database:

\`\`\`bash
# Connect to your MySQL database
mysql -h liamradford.me -u liamradf_timewaveradio -p liamradf_timewaveradio

# Then paste the contents of scripts/01-create-tables.sql
# Or run it directly:
mysql -h liamradford.me -u liamradf_timewaveradio -p liamradf_timewaveradio < scripts/01-create-tables.sql
\`\`\`

## Step 5: Build the Application

**IMPORTANT:** You must build the Next.js application before starting it with PM2.

\`\`\`bash
npm run build
\`\`\`

This command:
- Creates the optimized production build in `.next` directory
- Compiles all TypeScript to JavaScript
- Optimizes assets and images
- Generates static pages where possible

**Note:** If this fails, check the error messages and ensure all environment variables are set correctly in `.env.local`.

## Step 6: Start with PM2

You have two options to start the application:

### Option A: Direct PM2 Command (No Config File Needed)

\`\`\`bash
cd ~/prod-dev.timewave.org.uk

# Start with PM2 directly
pm2 start npm --name "timewave-radio" --cwd ~/prod-dev.timewave.org.uk -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it outputs (usually a sudo command)
\`\`\`

### Option B: Using ecosystem.config.js

\`\`\`bash
# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it outputs (usually a sudo command)
\`\`\`

**Both methods work identically** - Option A just passes configuration inline instead of using a config file.

Verify the application is running:

\`\`\`bash
pm2 status
pm2 logs timewave-radio --lines 50
\`\`\`

## Step 7: Configure Nginx (Optional but Recommended)

If you want to run on port 80/443 instead of 3030:

\`\`\`bash
sudo nano /etc/nginx/sites-available/timewave-radio
\`\`\`

Add this configuration:

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3030;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

Enable the site:

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/timewave-radio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

## Step 8: Setup Cron Job for Live Detection

The live broadcasting detection needs to run every minute. Add a cron job:

\`\`\`bash
crontab -e
\`\`\`

Add this line:

\`\`\`cron
* * * * * curl -X POST http://localhost:3030/api/cron/live-detector -H "Authorization: Bearer your_random_cron_secret" > /dev/null 2>&1
