"use server";

import transporter from "@/lib/nodemailer";

const styles = {
  container:
    "max-width:600px;margin:20px auto;padding:30px;border-radius:8px;background-color:#f8f9fa;font-family:Arial,sans-serif;box-shadow:0 4px 6px rgba(0,0,0,0.1)",
  header: "margin-bottom:25px;text-align:center",
  // logo: "width:120px;margin-bottom:15px",
  title: "font-size:24px;font-weight:600;color:#333;margin-bottom:5px",
  subtitle: "font-size:16px;color:#666;margin-bottom:20px",
  divider: "border:none;height:1px;background-color:#e0e0e0;margin:20px 0",
  content: "padding:15px 0",
  paragraph: "font-size:16px;line-height:1.6;color:#444;margin-bottom:20px",
  button:
    "display:inline-block;padding:12px 24px;background-color:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:500;text-align:center;transition:background-color 0.2s",
  buttonContainer: "margin:25px 0;text-align:center",
  footer:
    "margin-top:30px;font-size:12px;color:#888;text-align:center;border-top:1px solid #e0e0e0;padding-top:20px",
};

export async function sendEmailAction({
  to,
  subject,
  meta,
}: {
  to: string;
  subject: string;
  meta: {
    description: string;
    link: string;
  };
}) {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to,
    subject: `Package Management - ${subject}`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">

          <h1 style="${styles.title}">${subject}</h1>
          <p style="${styles.subtitle}">Package Management System</p>
        </div>

        <hr style="${styles.divider}">

        <div style="${styles.content}">
          <p style="${styles.paragraph}">${meta.description}</p>

          <div style="${styles.buttonContainer}">
            <a href="${meta.link}" style="${styles.button}">ดำเนินการต่อ</a>
          </div>
        </div>

        <div style="${styles.footer}">
          <p>© ${new Date().getFullYear()} Package Management System. All rights reserved.</p>
          <p>If you didn't request this email, please ignore it or contact support.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (err) {
    console.error("sendEmailAction", err);
    return { success: false };
  }
}
