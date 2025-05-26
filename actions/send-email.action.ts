"use server";

import transporter from "@/lib/nodemailer";

const styles = {
  container:
    "max-width:600px;margin:20px auto;padding:30px;border-radius:12px;background-color:#ffffff;font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;box-shadow:0 4px 10px rgba(0,0,0,0.05);border:1px solid #f1f1f1",
  header: "margin-bottom:30px;text-align:center",
  title:
    "font-size:28px;font-weight:700;color:#171717;margin-bottom:8px;letter-spacing:-0.025em",
  subtitle: "font-size:16px;color:#6b7280;margin-bottom:0;font-weight:400",
  divider: "border:none;height:1px;background-color:#f3f4f6;margin:24px 0",
  content: "padding:0",
  paragraph: "font-size:16px;line-height:1.7;color:#374151;margin-bottom:24px",
  button:
    "display:inline-block;padding:12px 28px;background-color:#000000;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:500;text-align:center;transition:all 0.2s ease;font-size:15px;border:1px solid #000000;box-shadow:0 1px 2px rgba(0,0,0,0.05)",
  buttonHover: "background-color:#ffffff;color:#000000;",
  buttonContainer: "margin:32px 0;text-align:center",
  footer:
    "margin-top:32px;font-size:13px;color:#6b7280;text-align:center;border-top:1px solid #f3f4f6;padding-top:24px",
  logo: "width:40px;height:40px;border-radius:9999px;background-color:#000000;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;color:#ffffff;font-size:20px;font-weight:bold",
  infoBox:
    "background-color:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;border-left:4px solid #000000",
  infoText: "margin:0;font-size:14px;color:#4b5563",
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
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0;padding:0;background-color:#f9fafb;color:#374151;">
        <div style="${styles.container}">
          <div style="${styles.header}">

            <h1 style="${styles.title}">${subject}</h1>
            <p style="${styles.subtitle}">Package Management System</p>
          </div>

          <hr style="${styles.divider}">

          <div style="${styles.content}">
            <div style="${styles.infoBox}">
              <p style="${
                styles.infoText
              }">โปรดดำเนินการโดยเร็วที่สุดเพื่อความปลอดภัยของบัญชีของคุณ</p>
            </div>

            <p style="${styles.paragraph}">${meta.description}</p>

            <div style="${styles.buttonContainer}">
              <a href="${meta.link}" style="${
      styles.button
    }" onmouseover="this.style='${
      styles.button + styles.buttonHover
    }'" onmouseout="this.style='${styles.button}'">Continue</a>
            </div>

            <p style="${
              styles.paragraph
            }">หากคุณไม่ได้เป็นผู้ร้องขอการดำเนินการนี้ คุณสามารถละเว้นอีเมลฉบับนี้ได้</p>
          </div>

          <div style="${styles.footer}">
            <p>© ${new Date().getFullYear()} Package Management System. All rights reserved.</p>
            <p>หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        </div>
      </body>
      </html>
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
