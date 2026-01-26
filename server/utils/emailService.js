import nodemailer from 'nodemailer';

// Gmail SMTP Configuration (primary - no domain required)
// To use: Enable 2FA in Google Account, then create an App Password at:
// https://myaccount.google.com/apppasswords
// ... imports

console.log("DEBUG EMAIL CONFIG:");
console.log("User:", process.env.GMAIL_USER);
console.log("Pass Length:", process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : "MISSING");
console.log("First Char of Pass:", process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD[0] : "N/A");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,     // Your Gmail: example@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD  // App password (NOT your Gmail password)
    }
});

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// Generate 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Gmail SMTP
export const sendOTPEmail = async (email, otp, purpose = 'registration') => {
    const subjects = {
        registration: 'Verify Your Email - AIM Learning',
        password_reset: 'Reset Your Password - AIM Learning',
        email_change: 'Confirm Email Change - AIM Learning'
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎓 AIM Learning</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Learning Journey Starts Here</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Verify Your Email</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                ${purpose === 'registration' ? 'Welcome! Please use the OTP below to complete your registration:' :
            purpose === 'password_reset' ? 'Use this OTP to reset your password:' :
                'Use this OTP to confirm your email change:'}
            </p>
            
            <!-- OTP Box -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px 40px; border-radius: 12px; display: inline-block; margin: 20px 0;">
                <span style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
            </div>
            
            <p style="color: #999; font-size: 14px; margin: 30px 0 0 0;">
                ⏱️ This OTP expires in <strong>10 minutes</strong>
            </p>
            <p style="color: #999; font-size: 14px; margin: 10px 0 0 0;">
                If you didn't request this, please ignore this email.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 AIM Learning. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;

    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║  ⚠️  GMAIL NOT CONFIGURED - DEVELOPMENT MODE               ║');
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log(`║  Email: ${email.padEnd(48)}║`);
        console.log(`║  OTP:   ${otp.padEnd(48)}║`);
        console.log('║                                                            ║');
        console.log('║  To enable real emails, add to .env:                       ║');
        console.log('║  GMAIL_USER=your-email@gmail.com                           ║');
        console.log('║  GMAIL_APP_PASSWORD=your-app-password                      ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');
        return { success: true, messageId: 'dev-mode', provider: 'console', otp };
    }

    try {
        const info = await transporter.sendMail({
            from: `"AIM Learning" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: subjects[purpose] || subjects.registration,
            html: htmlContent
        });

        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId, provider: 'gmail' };
    } catch (error) {
        console.error('❌ Email failed:', error.message);

        // Development fallback - log OTP to console
        if (isDevelopment) {
            console.log('\n╔════════════════════════════════════════════════════════════╗');
            console.log('║  📧 EMAIL FAILED - SHOWING OTP FOR DEV TESTING             ║');
            console.log('╠════════════════════════════════════════════════════════════╣');
            console.log(`║  Email: ${email.padEnd(48)}║`);
            console.log(`║  OTP:   ${otp.padEnd(48)}║`);
            console.log(`║  Error: ${error.message.slice(0, 46).padEnd(48)}║`);
            console.log('╚════════════════════════════════════════════════════════════╝\n');
            return { success: true, messageId: 'dev-fallback', provider: 'console', otp };
        }

        throw error;
    }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, name) => {
    // Skip if Gmail not configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log('📧 Welcome email skipped (Gmail not configured)');
        return { success: false };
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to AIM Learning!</h1>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Hi ${name}! 👋</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Your email has been verified successfully. You now have full access to our learning platform!
            </p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/Course-List" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
                Start Learning Now →
            </a>
        </div>
    </div>
</body>
</html>
    `;

    try {
        await transporter.sendMail({
            from: `"AIM Learning" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Welcome to AIM Learning! 🎓',
            html: htmlContent
        });
        console.log('✅ Welcome email sent');
        return { success: true };
    } catch (error) {
        console.error('Welcome email failed:', error.message);
        return { success: false };
    }
};
