import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import twilio from '@/lib/twilio';
import resend from '@/lib/resend';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // Check if the request is JSON (for web API) or FormData (for SMS/email)
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle Web API message
      const body = await request.json();
      
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

      // Validate required fields
      if (!body.title || !body.content || !body.priority) {
        return NextResponse.json({ 
          error: 'Missing required fields: title, content, priority' 
        }, { status: 400 });
      }

      // Create Web API message
      const webMessage = await prisma.msgApiLog.create({
        data: {
          id: crypto.randomUUID(), // Generate a unique ID
          title: body.title,
          content: body.content,
          priority: body.priority,
          type: body.type || 'web',
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
          isPublished: body.isPublished || false,
          userId: session.user.id
        }
      });

      console.log('Web API Message Created:', {
        messageId: webMessage.id,
        title: webMessage.title,
        priority: webMessage.priority,
        type: webMessage.type,
        userId: webMessage.userId,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: webMessage
      });
    } else {
      // Handle existing SMS and Email functionality
      const formData = await request.formData();
      const type = formData.get('type') as string;

      if (type === 'sms') {
        const message = formData.get('message') as string;
        const recipients = JSON.parse(formData.get('recipients') as string);
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
            userId: (await prisma.session.findFirst({
              where: { expires: { gt: new Date() } },
              include: { user: true }
            }))?.user?.id ?? (() => { throw new Error('User not found') })()
          }
        });

        return NextResponse.json({
          success: true,
          results
        });
      } else if (type === 'email') {
        const subject = formData.get('subject') as string;
        const attachments = formData.getAll('attachments') as File[];

        const recipients = JSON.parse(formData.get('recipients') as string);
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
              html: formData.get('message') as string,
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
            message: formData.get('message') as string,
            recipients: recipients.map((r: any) => r.email),
            status: results.every(r => r.success) ? 'success' : 'partial',
            messageId: results.find(r => r.success)?.messageId,
            error: results.filter(r => !r.success).map(r => r.error).join(', ') || null,
            attachments: attachments.length > 0 
              ? { files: attachments.map(f => f.name) }
              : undefined,
            userId: (await prisma.session.findFirst({
              where: { expires: { gt: new Date() } },
              include: { user: true }
            }))?.user?.id ?? (() => { throw new Error('Unauthorized: User not found') })()
          }
        });

        return NextResponse.json({
          success: true,
          results
        });
      }

      return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Message sending error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add GET method to fetch messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'web';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const messages = await prisma.msgApiLog.findMany({
      where: {
        type,
        isPublished: true,
        OR: [
          { expiryDate: null },
          { expiryDate: { gt: new Date() } }
        ]
      },
      orderBy: {
        created: 'desc'
      },
      take: limit
    });

    console.log(`Fetched ${messages.length} messages of type: ${type}`);

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
