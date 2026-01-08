# Email Service Setup Guide

This application uses Nodemailer to send emails. You can configure it to use various email providers.

## Quick Setup

### Option 1: Gmail (Easiest for Development)

1. Enable 2-Step Verification on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new App Password for "Mail"
4. Add to your `backend/.env` file:

```env
EMAIL_SERVICE=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Blejta
```

### Option 2: SendGrid (Recommended for Production)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your sender email/domain
3. Create an API key at [SendGrid API Keys](https:RIJrrrijjad//app.sendgrid.com/settings/api_keys)
4. Add to your `backend/.env` file:

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-api-key-here
EMAIL_FROM=your-verified-email@example.com
EMAIL_FROM_NAME=Blejta
```

### Option 3: Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Verify your domain
3. Get your API key from the dashboard
4. Add to your `backend/.env` file:

```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=your-domain.com
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=Blejta
```

### Option 4: AWS SES

1. Set up AWS SES in your AWS account
2. Verify your email/domain
3. Create IAM user with SES sending permissions
4. Get Access Key and Secret Key
5. Add to your `backend/.env` file:

```env
EMAIL_SERVICE=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY=your-access-key
AWS_SES_SECRET_KEY=your-secret-key
EMAIL_FROM=your-verified-email@example.com
EMAIL_FROM_NAME=Blejta
```

### Option 5: Generic SMTP

Works with any SMTP server (e.g., your hosting provider's email):

```env
EMAIL_SERVICE=
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=your-email@example.com
EMAIL_FROM_NAME=Blejta
```

## Testing

After configuring your email service:

1. Restart your backend server
2. Check the logs - you should see: `Email service initialized: [Provider Name]`
3. Test the forgot password functionality
4. Check your email inbox for the password reset link

## Development Mode

If no email configuration is provided, the application will:
- Log email details to the console
- Display the reset link in backend logs
- Still allow password reset functionality for testing

## Troubleshooting

### Gmail Issues
- Make sure you're using an **App Password**, not your regular password
- App Passwords are 16 characters with no spaces
- 2-Step Verification must be enabled

### SendGrid Issues
- Verify your sender email/domain in SendGrid dashboard
- Check that your API key has "Mail Send" permissions
- Ensure your account is not in sandbox mode (or verify recipient emails)

### Generic SMTP Issues
- Check your hosting provider's SMTP settings
- Some providers require specific ports (587 for TLS, 465 for SSL)
- Set `SMTP_SECURE=true` for SSL/TLS connections on port 465

### Common Errors
- **"Invalid login"**: Check your credentials
- **"Connection timeout"**: Verify SMTP host and port
- **"Authentication failed"**: Ensure you're using the correct authentication method

## Security Notes

- Never commit `.env` files to version control
- Use environment-specific credentials
- Rotate API keys regularly
- Use App Passwords for Gmail instead of your main password
- For production, use a dedicated email service (SendGrid, Mailgun, AWS SES)
