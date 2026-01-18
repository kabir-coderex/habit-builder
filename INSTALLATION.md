# 📦 Installation Instructions

## After Cloning the Repository

When you clone this repository, you need to install dependencies before running the development servers.

### Step 1: Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### Step 2: Install All Dependencies

Run this command from the root of the project:

```bash
pnpm install
```

This will install all dependencies for:
- Root workspace
- Guardian Dashboard app
- PWA app
- All shared packages

### Step 3: Install Additional Required Packages

The project uses some packages that may need explicit installation:

```bash
# Install Sass for SCSS support
pnpm add -D sass --filter=guardian-dashboard
pnpm add -D sass --filter=pwa
```

### Step 4: Verify Installation

Check that node_modules exist in:
- `/node_modules` (root)
- `/apps/guardian-dashboard/node_modules`
- `/apps/pwa/node_modules`

### Step 5: Set Up Environment Variables

Create `.env.local` files in both apps (see QUICKSTART.md for details):

**apps/guardian-dashboard/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

**apps/pwa/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

### Step 6: Run Development Servers

```bash
pnpm dev
```

This starts both apps:
- Guardian Dashboard: http://localhost:3000
- PWA: http://localhost:3001

## Troubleshooting

### "Cannot find module" errors

If you see TypeScript errors about missing modules:

```bash
# Clean install
rm -rf node_modules
rm -rf apps/*/node_modules
rm pnpm-lock.yaml
pnpm install
```

### SCSS compilation errors

Make sure sass is installed:
```bash
pnpm add -D sass --filter=guardian-dashboard
pnpm add -D sass --filter=pwa
```

### Port already in use

If ports 3000 or 3001 are in use:

```bash
# Kill processes on those ports (macOS/Linux)
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Or run on different ports
PORT=3002 pnpm --filter guardian-dashboard dev
PORT=3003 pnpm --filter pwa dev
```

### Supabase connection errors

1. Verify your environment variables are correct
2. Check that your Supabase project is active
3. Ensure you're using the ANON key, not SERVICE_ROLE key
4. Test connection in Supabase Dashboard > API Docs

## Development Tips

### Running Individual Apps

```bash
# Just the dashboard
pnpm --filter guardian-dashboard dev

# Just the PWA
pnpm --filter pwa dev
```

### Building for Production

```bash
# Build all apps
pnpm build

# Build individual app
pnpm --filter guardian-dashboard build
pnpm --filter pwa build
```

### Linting

```bash
# Lint all apps
pnpm lint

# Lint individual app
pnpm --filter guardian-dashboard lint
```

### Type Checking

```bash
# Check types
pnpm --filter guardian-dashboard tsc --noEmit
pnpm --filter pwa tsc --noEmit
```

## Package Versions

This project uses:
- Node.js: 18+
- pnpm: 8.6.0+
- Next.js: 14.2.3
- React: 18
- TypeScript: 5+
- Supabase JS: 2.90.1+

## Need Help?

If you encounter issues during installation:

1. Check Node.js version: `node --version` (should be 18+)
2. Check pnpm version: `pnpm --version` (should be 8+)
3. Try cleaning and reinstalling (see Troubleshooting above)
4. Check the error messages carefully
5. Refer to QUICKSTART.md for a complete setup guide

---

Happy coding! 🚀
