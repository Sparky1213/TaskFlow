import nodemailer from "nodemailer";

type InviteEmailInput = {
  to: string;
  projectName: string;
  inviterName: string;
  inviteLink: string;
};

const getTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env",
    );
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendInviteEmail = async ({
  to,
  projectName,
  inviterName,
  inviteLink,
}: InviteEmailInput) => {
  const transporter = getTransporter();
  const fromEmail = process.env.MAIL_FROM || "Team Task Manager <no-reply@teamtask.local>";

  const info = await transporter.sendMail({
    from: fromEmail,
    to,
    subject: `Invitation to join ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>You are invited to ${projectName}</h2>
        <p>${inviterName} has invited you to collaborate in Team Task Manager.</p>
        <p>
          <a href="${inviteLink}" style="background:#2d6df6;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">
            Accept Invitation
          </a>
        </p>
        <p>If the button does not work, copy this URL:</p>
        <p>${inviteLink}</p>
      </div>
    `,
  });

  return {
    messageId: info.messageId,
  };
};
