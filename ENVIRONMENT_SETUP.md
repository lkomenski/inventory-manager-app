# Environment Configuration Setup

## Security Notice
This project uses environment files to manage sensitive configuration like API keys. **Never commit real API keys to version control.**

## Quick Setup

1. **Copy the environment template file:**
   ```bash
   cp src/environments/environment.ts src/environments/environment.local.ts
   ```

2. **Update with your actual values:**
   Edit `src/environments/environment.local.ts` and replace `YOUR_API_KEY_HERE` with your actual API key.

3. **Verify gitignore:**
   The file `environment.local.ts` is gitignored and will never be committed to version control.

## File Structure

- `environment.ts` - Template with placeholder values (committed to git) - users copy this to create their own config
- `environment.local.ts` - Your actual configuration with real API key (gitignored - never committed)

## Current Configuration

The application expects these environment variables:

- `apiUrl` - Base URL for the API endpoints
- `apiKey` - Your API key for authentication

## Production Deployment

For production deployments:

1. Update `environment.prod.ts` with production values
2. Or use your CI/CD system to inject environment variables
3. Never commit production secrets to version control

## Troubleshooting

If you get import errors:
1. Make sure `environment.local.ts` exists
2. Verify it exports an `environment` object
3. Check that all required properties are defined