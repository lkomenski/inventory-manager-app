# Environment Configuration Setup

## Security Notice
This project uses environment files to manage sensitive configuration like API keys. **Never commit real API keys to version control.**

## Quick Setup

1. **Copy the environment template:**
   ```bash
   cp src/environments/environment.ts src/environments/environment.local.ts
   ```

2. **Add your API key:**
   Edit `src/environments/environment.local.ts` and replace `YOUR_API_KEY_HERE` with your actual key.

## File Structure

- `environment.ts` - Committed template with placeholder values; copy this to create your local config
- `environment.local.ts` - Your local configuration with a real API key (gitignored)

## Current Configuration

The app reads its configuration from the exported `environment` object. The required properties are:

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