# Deployment Guide

This documentation site is built with VitePress and deployed to GitHub Pages.

## Automatic Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

### GitHub Actions Workflow

The deployment is handled by `.github/workflows/deploy.yml` which:

1. Checks out the code
2. Installs Node.js and dependencies
3. Builds the VitePress site
4. Deploys to GitHub Pages

### First Time Setup

To enable GitHub Pages for this repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - The workflow will handle the rest automatically

4. Once configured, every push to `main` will trigger a deployment

### URL

The site will be available at: `https://esorjs.github.io/doc/`

## Local Development

To run the documentation locally:

```bash
# Install dependencies
npm install

# Start dev server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

## Manual Deployment (Not Recommended)

If you need to deploy manually, use the script:

```bash
bash scripts/deploy.sh
```

**Note:** The automatic GitHub Actions deployment is preferred as it's more reliable and doesn't require local build artifacts.

## Troubleshooting

### Jekyll Errors

If you see Jekyll-related errors, ensure:
- `.nojekyll` file exists in the `public/` directory (it does)
- GitHub Pages source is set to "GitHub Actions" (not "Deploy from a branch")

### Build Failures

Check the Actions tab on GitHub to see detailed error logs:
`https://github.com/esorjs/doc/actions`

### Base URL Issues

The site is configured with `base: '/doc/'` in `.vitepress/config.mjs`. This must match your repository name for proper routing.

If deploying to a custom domain or root domain, change this to `base: '/'`.

## Configuration Files

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `.vitepress/config.mjs` - VitePress configuration
- `public/.nojekyll` - Disables Jekyll processing
- `package.json` - Build scripts and dependencies

## Updates

After making changes:

1. Commit your changes to a feature branch
2. Create a pull request to `main`
3. Merge the PR
4. GitHub Actions will automatically deploy the updated site

---

For more information:
- [VitePress Documentation](https://vitepress.dev/)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [GitHub Actions Documentation](https://docs.github.com/actions)
