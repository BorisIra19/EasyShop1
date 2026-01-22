export declare const sendEmail: (to: string, subject: string, text: string, html?: string) => Promise<import("nodemailer/lib/smtp-pool").SentMessageInfo | null | undefined>;
export declare const verifyEmailConfig: () => Promise<boolean>;
//# sourceMappingURL=email.d.ts.map