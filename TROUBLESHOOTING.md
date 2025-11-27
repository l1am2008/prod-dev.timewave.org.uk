# Troubleshooting Guide

## Build Errors

### "pnpm: not found" Error

**Problem:** Next.js is trying to use pnpm but the project uses npm.

**Solution:**
\`\`\`bash
chmod +x fix-build.sh
./fix-build.sh
\`\`\`

Or manually:
\`\`\`bash
rm -f pnpm-lock.yaml
rm -rf .next
npm install
npm run build
\`\`\`

### Database Connection Errors

**Problem:** "Failed to connect to database" or similar errors.

**Checklist:**
1. Verify `.env.local` exists with correct credentials
2. Check MySQL server is running: `mysql -h liamradford.me -u liamradf_timewaveradio -p`
3. Verify your Ubuntu server IP is whitelisted in cPanel MySQL Remote Hosts
4. Check database exists: `SHOW DATABASES;`

**Test connection:**
\`\`\`bash
node scripts/setup-database.js
\`\`\`

### SMTP/Email Errors

**Problem:** "Greeting never received" or email timeout errors.

**Solution:** SMTP is optional. If you don't want to configure email, the app will still work. Email verification will be skipped.

To fix SMTP:
1. Verify SMTP credentials in `.env.local`
2. Check SMTP port is not blocked by firewall
3. Test with a different SMTP provider

### PM2 Won't Start

**Problem:** "start: No such file or directory"

**Solution:**
\`\`\`bash
# Build the app first
npm run build

# Then start PM2
pm2 start npm --name "timewave-radio" --cwd ~/prod-dev.timewave.org.uk -- start
\`\`\`

### Admin Portal 500 Errors

**Problem:** Getting 500 errors when accessing admin pages.

**Checklist:**
1. Check PM2 logs: `pm2 logs timewave-radio --lines 100`
2. Verify admin user exists in database
3. Check JWT_SECRET is set in `.env.local`
4. Verify database tables were created: `npm run setup-db`

### Port Already in Use

**Problem:** "EADDRINUSE: address already in use :::3030"

**Solution:**
\`\`\`bash
# Find process using port 3030
lsof -i :3030

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or stop PM2 first
pm2 stop timewave-radio
pm2 start npm --name "timewave-radio" --cwd ~/prod-dev.timewave.org.uk -- start
\`\`\`

## Git/Deployment Issues

### Git Pull Conflicts

**Problem:** "Your local changes would be overwritten by merge"

**Solution:**
\`\`\`bash
./update.sh
\`\`\`

Or manually:
\`\`\`bash
cp .env.local .env.local.backup
git reset --hard HEAD
git clean -fd
git pull origin main
cp .env.local.backup .env.local
npm install && npm run build && pm2 restart timewave-radio
\`\`\`

### Update Script Not Working

**Problem:** `./update.sh` gives "Permission denied"

**Solution:**
\`\`\`bash
chmod +x update.sh
chmod +x quick-update.sh
chmod +x force-update.sh
chmod +x fix-build.sh
./update.sh
\`\`\`

## Common Issues

### Can't Access Website

**Checklist:**
1. Check PM2 status: `pm2 status`
2. Check if port 3030 is open: `sudo ufw status`
3. Open port if needed: `sudo ufw allow 3030`
4. Check logs: `pm2 logs timewave-radio`
5. Verify app is running: `curl http://localhost:3030`

### Registration Not Working

**Checklist:**
1. Check browser console for errors
2. Verify database connection (check PM2 logs)
3. Check API route: `curl -X POST http://localhost:3030/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","username":"test","password":"Test1234","firstName":"Test","lastName":"User"}'`

### AzuraCast Integration Not Working

**Checklist:**
1. Verify `AZURACAST_API_KEY` in `.env.local`
2. Test API manually: `curl https://admin.stream.timewave.org.uk/api/nowplaying/timewave_radio`
3. Check API route logs in PM2

## Getting Help

If these solutions don't work:

1. **Check logs:** `pm2 logs timewave-radio --lines 200`
2. **View error details:** Look at the PM2 error log file: `tail -n 100 ~/.pm2/logs/timewave-radio-error.log`
3. **Restart everything:**
   \`\`\`bash
   pm2 stop timewave-radio
   npm install
   npm run build
   pm2 start npm --name "timewave-radio" --cwd ~/prod-dev.timewave.org.uk -- start
   \`\`\`

## Useful Commands

\`\`\`bash
# View all PM2 processes
pm2 status

# View logs
pm2 logs timewave-radio

# Restart app
pm2 restart timewave-radio

# Stop app
pm2 stop timewave-radio

# Delete from PM2
pm2 delete timewave-radio

# Check database
mysql -h liamradford.me -u liamradf_timewaveradio -p liamradf_timewaveradio

# Test database connection
node -e "require('dotenv').config({path:'.env.local'});const mysql=require('mysql2/promise');mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME}).then(()=>console.log('✅ Connected')).catch(e=>console.log('❌ Error:',e.message));"

# View current environment variables
cat .env.local

# Check Node.js version
node --version

# Check npm version
npm --version
