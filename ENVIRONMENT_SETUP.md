# Environment Configuration Setup

## Security Notice
This project uses environment files to manage sensitive configuration like API keys. **Never commit real API keys to version control.**

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp src/environments/environment.local.example.ts src/environments/environment.local.ts
   ```

2. **Update with your actual values:**
   Edit `src/environments/environment.local.ts` and replace `YOUR_API_KEY_HERE` with your actual API key.

3. **Verify gitignore:**
   The file `environment.local.ts` should be gitignored and never committed.

## File Structure

- `environment.ts` - Template with placeholder values (committed to git)
- `environment.local.ts` - Your actual configuration (gitignored) 
- `environment.local.example.ts` - Example file showing structure (committed to git)
- `environment.prod.ts` - Production template (committed to git)

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