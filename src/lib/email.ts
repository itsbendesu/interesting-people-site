import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "Interesting People <hello@interestingpeople.com>";

interface SendOpts {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendOpts) {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: "hello@interestingpeople.com",
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Email failed: ${error.message}`);
  }

  return data;
}

// ── Templates ──────────────────────────────────────────

const WRAPPER = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:20px;font-weight:700;color:#1c1917;letter-spacing:0.05em;">IP<sup style="font-size:12px;color:#2563eb;font-weight:700;vertical-align:super;">4</sup></span>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:32px 28px;border:1px solid #e7e5e4;">
      ${content}
      <p style="font-size:15px;color:#44403c;line-height:1.6;margin:24px 0 0;">&mdash; The IP4 Team</p>
    </div>
    <div style="margin-top:24px;text-align:center;">
      <p style="font-size:12px;color:#a8a29e;margin:0;">IP Events &mdash; Victoria, BC</p>
    </div>
  </div>
</body>
</html>`;

export function applicationConfirmationEmail(name: string) {
  const firstName = name.split(/\s+/)[0];
  return {
    subject: "We got your application — IP4",
    html: WRAPPER(`
      <h1 style="font-size:22px;color:#1c1917;font-weight:600;margin:0 0 16px;">Hey ${firstName},</h1>
      <p style="font-size:15px;color:#44403c;line-height:1.6;margin:0 0 12px;">
        Your application for Interesting People 4 has been received. Thanks for putting yourself out there.
      </p>
      <p style="font-size:15px;color:#44403c;line-height:1.6;margin:0 0 12px;">
        A real human reads every single application &mdash; no AI screening, no keyword filters. We&rsquo;ll get back to you within a few weeks with a yes, no, or waitlist.
      </p>
      <p style="font-size:15px;color:#44403c;line-height:1.6;margin:0;">
        In the meantime, sit tight. We&rsquo;ll be in touch.
      </p>
    `),
  };
}
