# Updating Your Deployment

## Standard Update (Recommended)

When you push changes to your Git repository, update the server with:

\`\`\`bash
cd /root/prod-dev.timewave.org.uk
chmod +x update.sh
./update.sh
\`\`\`

This will:
1. Pull latest changes from Git
2. Preserve your .env.local file
3. Install new dependencies
4. Rebuild the app
5. Restart PM2

## Quick Update (For Minor Changes)

If you only changed content/text and don't need a rebuild:

\`\`\`bash
cd /root/prod-dev.timewave.org.uk
chmod +x quick-update.sh
./quick-update.sh
\`\`\`

## Manual Update Steps

If you prefer manual control:

\`\`\`bash
# 1. Navigate to project
cd /root/prod-dev.timewave.org.uk

# 2. Pull latest changes
git pull origin main

# 3. Install dependencies (if package.json changed)
npm install

# 4. Rebuild (if code changed)
npm run build

# 5. Restart PM2
pm2 restart timewave-radio
\`\`\`

## Protecting Local Files

Your `.env.local` file should NOT be tracked by Git. To ensure it's never overwritten:

\`\`\`bash
# Check if .env.local is ignored
cat .gitignore | grep .env.local

# If not, add it
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Ignore .env.local"
git push
\`\`\`

## Handling Merge Conflicts

If you have local changes that conflict with the remote:

\`\`\`bash
# See what changed locally
git status

# Option 1: Discard local changes and use remote version
git reset --hard origin/main

# Option 2: Keep both and resolve manually
git pull origin main
# Edit conflicted files
git add .
git commit -m "Resolved conflicts"

# Then rebuild and restart
npm run build
pm2 restart timewave-radio
\`\`\`

## Automated Updates (Optional)

To automatically pull and deploy on a schedule:

\`\`\`bash
# Edit crontab
crontab -e

# Add this line to update daily at 3 AM
0 3 * * * cd /root/prod-dev.timewave.org.uk && git pull origin main && npm install && npm run build && pm2 restart timewave-radio >> /var/log/timewave-update.log 2>&1
\`\`\`

## Troubleshooting

### "error: Your local changes would be overwritten by merge"

\`\`\`bash
# Save your changes
git stash

# Pull updates
git pull origin main

# Restore your changes
git stash pop
\`\`\`

### "Cannot pull with rebase: You have unstaged changes"

\`\`\`bash
# Commit your changes first
git add .
git commit -m "Local changes"
git pull origin main
\`\`\`

### Build fails after update

\`\`\`bash
# Clear everything and start fresh
rm -rf node_modules .next
npm install
npm run build
pm2 restart timewave-radio
\`\`\`

## Development Workflow

1. **Make changes locally** (in v0 or your editor)
2. **Push to Git**: Changes are automatically committed to your repository
3. **Update server**: Run `./update.sh` on your Ubuntu server
4. **Test**: Visit your site to verify changes

## Pro Tips

- Always test changes in v0 preview before deploying
- Check PM2 logs after updates: `pm2 logs timewave-radio`
- Keep your Node.js version updated: `node -v`
- Monitor disk space: `df -h`
- Back up your database regularly
