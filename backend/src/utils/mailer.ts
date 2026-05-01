import { Resend } from "resend";

type InviteEmailInput = {
  to: string;
  projectName: string;
  inviterName: string;
  inviteLink: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteEmail = async ({
  to,
  projectName,
  inviterName,
  inviteLink,
}: InviteEmailInput) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured in .env");
  }

  const fromEmail =
    process.env.MAIL_FROM || "Team Task Manager <onboarding@resend.dev>";

  try {
    const response = await resend.emails.send({
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
      id: response.data?.id,
    };
  } catch (error) {
    console.error("Resend Email Error:", error);
    throw new Error("Failed to send invite email");
  }
};