# Timewave Radio - Quick Start Guide

## One-Command Setup

Follow these steps to get your Timewave Radio website running on Ubuntu:

### 1. Install Prerequisites

\`\`\`bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MySQL client (for database setup)
sudo apt-get install -y mysql-client
\`\`\`

### 2. Upload and Setup Project

\`\`\`bash
# Navigate to your project directory
cd /var/www/timewave-radio

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
nano .env.local
# Edit with your actual credentials
\`\`\`

### 3. Database Setup

\`\`\`bash
# Run automated database setup
npm run setup-db

# Create super admin account
npm run create-admin admin@timewave.uk admin YourSecurePassword123
\`\`\`

### 4. Build and Start

\`\`\`bash
# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable startup on boot
pm2 startup
# Run the command it outputs
\`\`\`

### 5. Setup Cron Job

\`\`\`bash
# Open crontab
crontab -e

# Add this line (replace CRON_SECRET with your secret from .env.local):
* * * * * curl -X POST http://localhost:3030/api/cron/live-detector -H "Authorization: Bearer YOUR_CRON_SECRET" > /dev/null 2>&1
\`\`\`

### 6. Open Firewall (if needed)

\`\`\`bash
sudo ufw allow 3030
sudo ufw status
\`\`\`

## Access Your Site

- **Main Site:** http://your-server-ip:3030
- **Admin Portal:** http://your-server-ip:3030/admin
- **Staff Portal:** http://your-server-ip:3030/staff

## Important MySQL Remote Access

Your cPanel MySQL needs to allow connections from your Ubuntu server:

1. Login to cPanel
2. Go to "Remote MySQL"
3. Add your Ubuntu server's IP address
4. Save changes

## Common Issues

**Can't connect to database?**
\`\`\`bash
# Test connection
mysql -h liamradford.me -u liamradf_timewaveradio -p
\`\`\`

**Port 3030 already in use?**
\`\`\`bash
# Check what's using it
sudo netstat -tulpn | grep 3030

# Kill the process or change port in ecosystem.config.js
\`\`\`

**PM2 not starting?**
\`\`\`bash
# Check logs
pm2 logs timewave-radio

# Try starting manually
npm start
\`\`\`

## Production Checklist

- [ ] Environment variables configured in .env.local
- [ ] Database tables created
- [ ] Super admin account created
- [ ] Application built (npm run build)
- [ ] PM2 running the application
- [ ] PM2 startup configured for auto-restart
- [ ] Cron job configured for live detection
- [ ] Firewall allows port 3030
- [ ] MySQL remote access configured
- [ ] SMTP credentials tested
- [ ] AzuraCast API key configured

## Need Help?

Check the full deployment guide in `DEPLOYMENT.md` for detailed instructions and troubleshooting.
