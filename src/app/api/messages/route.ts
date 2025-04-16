import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import twilio from '@/lib/twilio';
import resend from '@/lib/resend';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const type = formData.get('type') as string;
    const message = formData.get('message') as string;
    const recipientsJson = formData.get('recipients') as string;
    const recipients = JSON.parse(recipientsJson);

    // Get the current user from the session
    const session = await prisma.session.findFirst({
      where: {
        expires: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (type === 'sms') {
      const smsPromises = recipients.map(async (recipient: any) => {
        try {
          const result = await twilio.messages.create({
            body: message,
            to: recipient.contact_number,
            from: process.env.TWILIO_PHONE_NUMBER
          });

          return {
            success: true,
            messageId: result.sid,
            recipient: recipient.contact_number
          };
        } catch (error: any) {
          console.error('SMS sending error:', error);
          return {
            success: false,
            error: error.message,
            recipient: recipient.contact_number
          };
        }
      });

      const results = await Promise.all(smsPromises);

      // Log the SMS sending attempt
      await prisma.smsLog.create({
        data: {
          message,
          recipients: recipients.map((r: any) => r.contact_number),
          status: results.every(r => r.success) ? 'success' : 'partial',
          messageIds: results.filter(r => r.success).map(r => r.messageId),
          error: results.filter(r => !r.success).map(r => r.error).join(', ') || null,
          userId: session.user.id
        }
      });

      return NextResponse.json({
        success: true,
        results
      });
    } else if (type === 'email') {
      const subject = formData.get('subject') as string;
      const attachments = formData.getAll('attachments') as File[];

      const emailPromises = recipients.map(async (recipient: any) => {
        try {
          const attachmentPromises = attachments.map(async (file) => ({
            filename: file.name,
            content: await file.arrayBuffer()
          }));

          const attachmentData = await Promise.all(attachmentPromises);

          const result = await resend.emails.send({
            from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
            to: recipient.email,
            subject: subject,
            html: message,
            attachments: attachmentData.map(att => ({
              filename: att.filename,
              content: Buffer.from(att.content)
            }))
          });

          return {
            success: true,
            messageId: result.data?.id,
            recipient: recipient.email
          };
        } catch (error: any) {
          console.error('Email sending error:', error);
          return {
            success: false,
            error: error.message,
            recipient: recipient.email
          };
        }
      });

      const results = await Promise.all(emailPromises);

      // Fixed: Handle attachments JSON properly for Prisma
      await prisma.emailLog.create({
        data: {
          subject,
          message,
          recipients: recipients.map((r: any) => r.email),
          status: results.every(r => r.success) ? 'success' : 'partial',
          messageId: results.find(r => r.success)?.messageId,
          error: results.filter(r => !r.success).map(r => r.error).join(', ') || null,
          attachments: attachments.length > 0 
            ? { files: attachments.map(f => f.name) }
            : undefined,
          userId: session.user.id
        }
      });

      return NextResponse.json({
        success: true,
        results
      });
    }

    return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
  } catch (error: any) {
    console.error('Message sending error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
