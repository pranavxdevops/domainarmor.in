import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    return transporter;
}

/**
 * Send an alert email when domain security issues are detected
 */
export async function sendAlertEmail({ to, domain, score, issues }) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('[MailService] SMTP not configured, skipping alert email.');
        return;
    }

    const issueList = issues.map((i) => `• ${i}`).join('\n');

    const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
      <h1 style="color: #f87171; margin-bottom: 8px;">⚠️ Security Alert</h1>
      <p style="font-size: 16px; color: #94a3b8;">A security issue was detected for your domain.</p>
      
      <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0;"><strong style="color: #818cf8;">Domain:</strong> ${domain}</p>
        <p style="margin: 0 0 8px 0;"><strong style="color: #818cf8;">Score:</strong> <span style="color: ${score < 60 ? '#f87171' : '#fbbf24'};">${score}/100</span></p>
        <p style="margin: 0;"><strong style="color: #818cf8;">Issues Found:</strong></p>
        <ul style="color: #fbbf24; margin-top: 8px;">
          ${issues.map((i) => `<li>${i}</li>`).join('')}
        </ul>
      </div>

      <p style="font-size: 14px; color: #64748b;">
        Log in to your Email Security Dashboard to see full details and recommended actions.
      </p>
    </div>
  `;

    try {
        await getTransporter().sendMail({
            from: `"Email Security Monitor" <${process.env.SMTP_USER}>`,
            to,
            subject: `⚠️ Security Alert: ${domain} — Score ${score}/100`,
            text: `Security Alert for ${domain}\n\nScore: ${score}/100\n\nIssues:\n${issueList}`,
            html,
        });
        console.log(`[MailService] Alert sent to ${to} for ${domain}`);
    } catch (error) {
        console.error('[MailService] Failed to send alert:', error.message);
    }
}
