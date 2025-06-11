# Security Guide

## 🔒 Security Considerations

This document outlines the security measures and requirements for the CarbonWise application.

## ⚠️ Important Security Notes

### Environment Variables Required

**NEVER commit these files to version control:**
- `.env.local`
- `.env`
- Any file containing actual API keys, secrets, or credentials

### Required Environment Variables

Copy `.env.example` to `.env.local` and fill in your actual values:

```bash
cp .env.example .env.local
```

Required variables:
- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret
- `NEXTAUTH_SECRET` - A secure random string for JWT signing
- `DATABASE_URL` - Path to your SQLite database

## 🔧 Chrome Extension Security

### Client ID Configuration

The Chrome extension requires a Google OAuth Client ID to be configured:

1. **For Development:**
   - Update `chrome-extension/config.js` with your Client ID
   - Update `chrome-extension/manifest.json` with the same Client ID

2. **For Production:**
   - Use a build script to inject the Client ID
   - Never commit actual credentials to the repository

### Important: Client Secret Handling

- **NEVER** store the Google Client Secret in the Chrome extension
- Client secrets are handled server-side only
- The extension only needs the Client ID for OAuth initialization

## 🛡️ Security Best Practices

### Authentication
- Uses NextAuth.js for secure session management
- JWT tokens for extension authentication
- OAuth 2.0 flow for Google authentication
- Secure cookie handling

### Database Security
- SQLite database with proper access controls
- No direct database exposure to client
- All database access through API routes

### API Security
- CORS protection
- Rate limiting (recommended for production)
- Input validation on all endpoints
- Secure JWT token handling

## 🚀 Production Deployment

### Environment Setup
1. Set all environment variables in your hosting platform
2. Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
3. Configure Google OAuth with production URLs
4. Update Chrome extension with production Client ID

### Security Headers
Consider adding these security headers in production:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HTTPS only)

## 📞 Security Issues

If you discover a security vulnerability, please:
1. Do NOT create a public GitHub issue
2. Email security concerns privately
3. Wait for confirmation before disclosing

## ✅ Security Checklist

Before deploying to production:

- [ ] All environment variables are set securely
- [ ] No hardcoded credentials in code
- [ ] `.env.local` is in `.gitignore`
- [ ] Chrome extension uses environment-specific Client ID
- [ ] Database is properly secured
- [ ] HTTPS is enabled in production
- [ ] Security headers are configured
- [ ] Regular dependency updates are scheduled 