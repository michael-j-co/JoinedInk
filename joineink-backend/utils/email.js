const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // For development, we'll use a test account
  // In production, you should use a real email service like SendGrid, Mailgun, etc.
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'ethereal.user@example.com',
      pass: process.env.SMTP_PASS || 'ethereal.password'
    }
  });
};

// Send keepsake book notification to recipient
const sendKeepsakeBookNotification = async (recipientEmail, recipientName, eventTitle, accessToken) => {
  try {
    const transporter = createTransporter();
    
    const keepsakeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/keepsake/${accessToken}`;
    
    const mailOptions = {
      from: `"JoinedInk" <${process.env.FROM_EMAIL || 'noreply@joineink.com'}>`,
      to: recipientEmail,
      subject: `Your Special Keepsake Book from "${eventTitle}" is Ready! 💕`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Keepsake Book is Ready</title>
          <style>
            body { 
              font-family: 'Georgia', serif; 
              line-height: 1.6; 
              margin: 0; 
              padding: 0; 
              background-color: #f9f9f9; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: white; 
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              margin-top: 20px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 20px;
              border-bottom: 2px solid #e0e0e0;
            }
            .title { 
              color: #8e44ad; 
              font-size: 28px; 
              margin-bottom: 10px; 
            }
            .subtitle { 
              color: #7f8c8d; 
              font-size: 16px; 
            }
            .content { 
              margin: 20px 0; 
              color: #2c3e50;
              font-size: 16px;
              line-height: 1.8;
            }
            .button { 
              display: inline-block; 
              padding: 15px 30px; 
              background-color: #8e44ad; 
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              margin: 20px 0;
            }
            .button:hover { 
              background-color: #9b59b6; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #e0e0e0; 
              text-align: center; 
              color: #95a5a6; 
              font-size: 14px;
            }
            .heart { 
              color: #e74c3c; 
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">JoinedInk</h1>
              <p class="subtitle">Your Keepsake Book is Ready!</p>
            </div>
            
            <div class="content">
              <p>Dear ${recipientName},</p>
              
              <p>We're excited to let you know that your special keepsake book from <strong>"${eventTitle}"</strong> is now ready to view!</p>
              
              <p>This beautiful collection contains heartfelt messages, images, and memories that have been lovingly compiled just for you. Each contribution represents someone's care and appreciation for you.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${keepsakeUrl}" class="button">View Your Keepsake Book</a>
              </div>
              
              <p>You can also download your keepsake book as a PDF to keep forever, or share it with close friends and family.</p>
              
              <p>We hope this collection of memories brings you joy and warmth.</p>
              
              <p>With love,<br>The JoinedInk Team</p>
            </div>
            
            <div class="footer">
              <p>Created with <span class="heart">♥</span> using JoinedInk</p>
              <p>If you have any issues accessing your keepsake book, please reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Dear ${recipientName},
        
        Your special keepsake book from "${eventTitle}" is now ready to view!
        
        This beautiful collection contains heartfelt messages, images, and memories that have been lovingly compiled just for you.
        
        View your keepsake book: ${keepsakeUrl}
        
        You can also download your keepsake book as a PDF to keep forever.
        
        With love,
        The JoinedInk Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Keepsake book notification sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Send keepsake book notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send contributor invitation email
const sendContributorInvitation = async (contributorEmail, eventTitle, contributorUrl, organizerName, deadline) => {
  try {
    const transporter = createTransporter();
    
    const deadlineDate = new Date(deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const mailOptions = {
      from: `"JoinedInk" <${process.env.FROM_EMAIL || 'noreply@joineink.com'}>`,
      to: contributorEmail,
      subject: `You're Invited to Contribute to "${eventTitle}" 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're Invited to Contribute</title>
          <style>
            body { 
              font-family: 'Georgia', serif; 
              line-height: 1.6; 
              margin: 0; 
              padding: 0; 
              background-color: #f9f9f9; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: white; 
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              margin-top: 20px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 20px;
              border-bottom: 2px solid #e0e0e0;
            }
            .title { 
              color: #8e44ad; 
              font-size: 28px; 
              margin-bottom: 10px; 
            }
            .subtitle { 
              color: #7f8c8d; 
              font-size: 16px; 
            }
            .content { 
              margin: 20px 0; 
              color: #2c3e50;
              font-size: 16px;
              line-height: 1.8;
            }
            .button { 
              display: inline-block; 
              padding: 15px 30px; 
              background-color: #27ae60; 
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              margin: 20px 0;
            }
            .button:hover { 
              background-color: #2ecc71; 
            }
            .deadline { 
              background-color: #fff3cd; 
              border: 1px solid #ffeaa7; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 20px 0;
              text-align: center;
              color: #856404;
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #e0e0e0; 
              text-align: center; 
              color: #95a5a6; 
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">JoinedInk</h1>
              <p class="subtitle">You're Invited to Contribute!</p>
            </div>
            
            <div class="content">
              <p>Hello!</p>
              
              <p>${organizerName ? `${organizerName} has` : 'Someone has'} invited you to contribute to a special keepsake book called <strong>"${eventTitle}"</strong>.</p>
              
              <p>This is your chance to share a heartfelt message, photos, drawings, or any creative element that will become part of a beautiful digital keepsake book for someone special.</p>
              
              <div class="deadline">
                <strong>⏰ Deadline: ${deadlineDate}</strong>
              </div>
              
              <p>Your contribution can include:</p>
              <ul>
                <li>A personal message with custom fonts and backgrounds</li>
                <li>Photos and images</li>
                <li>Hand-drawn doodles or artwork</li>
                <li>Your digital signature</li>
                <li>Fun stickers and decorations</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${contributorUrl}" class="button">Start Contributing</a>
              </div>
              
              <p>No account required - just click the link above and let your creativity flow!</p>
            </div>
            
            <div class="footer">
              <p>Created with ♥ using JoinedInk</p>
              <p>If you have any questions, please reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello!
        
        You've been invited to contribute to a special keepsake book called "${eventTitle}".
        
        Deadline: ${deadlineDate}
        
        Click here to contribute: ${contributorUrl}
        
        No account required - just click the link and share your heartfelt message!
        
        Best regards,
        The JoinedInk Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contributor invitation sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Send contributor invitation error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendKeepsakeBookNotification,
  sendContributorInvitation
}; 