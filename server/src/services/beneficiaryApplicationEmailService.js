import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  applicationApproved: (application, reviewedBy, projectTitle) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
        .status-approved { color: #10b981; font-weight: bold; font-size: 18px; }
        .footer { text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 14px; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        .info-box { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 15px 0; }
        .info-box h4 { margin: 0 0 10px 0; color: #10b981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Application Approved!</h1>
          <p>CareSynce Foundation</p>
        </div>
        <div class="content">
          <h2>Dear ${application.personalInfo?.firstName} ${application.personalInfo?.lastName},</h2>
          
          <p>We are pleased to inform you that your beneficiary application has been <span class="status-approved">APPROVED</span>.</p>
          
          <div class="info-box">
            <h4>Application Details:</h4>
            <ul>
              <li><strong>Project:</strong> ${projectTitle}</li>
              <li><strong>Application ID:</strong> ${application._id}</li>
              <li><strong>Status:</strong> <span class="status-approved">Approved</span></li>
              <li><strong>Approved By:</strong> ${reviewedBy}</li>
              <li><strong>Approval Date:</strong> ${new Date().toLocaleDateString('en-IN')}</li>
            </ul>
          </div>

          <p>Your account role has been updated to <strong>Beneficiary</strong>, and you can now access beneficiary-specific features on our platform.</p>

          <p>Our team will contact you shortly regarding the next steps and support distribution process. Please keep your documents ready for verification.</p>

          <div class="signature">
            <p>Best regards,<br>
            <strong>CareSynce Foundation Team</strong></p>
            <p>Email: support@caresynce.org<br>
            Phone: +91-XXXXXXXXXX</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 CareSynce Foundation. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  applicationRejected: (application, reviewedBy, projectTitle, reviewNotes) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
        .status-rejected { color: #ef4444; font-weight: bold; font-size: 18px; }
        .reason-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 14px; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        .info-box { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 15px 0; }
        .info-box h4 { margin: 0 0 10px 0; color: #ef4444; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Status Update</h1>
          <p>CareSynce Foundation</p>
        </div>
        <div class="content">
          <h2>Dear ${application.personalInfo?.firstName} ${application.personalInfo?.lastName},</h2>
          
          <p>We regret to inform you that your beneficiary application has been <span class="status-rejected">REJECTED</span>.</p>
          
          <div class="info-box">
            <h4>Application Details:</h4>
            <ul>
              <li><strong>Project:</strong> ${projectTitle}</li>
              <li><strong>Application ID:</strong> ${application._id}</li>
              <li><strong>Status:</strong> <span class="status-rejected">Rejected</span></li>
              <li><strong>Reviewed By:</strong> ${reviewedBy}</li>
              <li><strong>Review Date:</strong> ${new Date().toLocaleDateString('en-IN')}</li>
            </ul>
          </div>

          ${reviewNotes ? `
          <div class="reason-box">
            <h4>Reason for Rejection:</h4>
            <p>${reviewNotes}</p>
          </div>
          ` : ''}

          <p>We encourage you to review the application requirements and consider applying for other suitable projects in the future.</p>

          <p>If you have any questions about this decision or would like feedback on your application, please feel free to contact our support team.</p>

          <div class="signature">
            <p>Best regards,<br>
            <strong>CareSynce Foundation Team</strong></p>
            <p>Email: support@caresynce.org<br>
            Phone: +91-XXXXXXXXXX</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 CareSynce Foundation. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Send email function
export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CareSynce Foundation" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to, 'Message ID:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email to:', to, 'Error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send application status email
export const sendApplicationStatusEmail = async (application, status, reviewedBy, reviewNotes = '') => {
  try {
    const applicantEmail = application.contactInfo?.email;
    const projectTitle = application.projectTitle;

    if (!applicantEmail) {
      console.error('No email address found for applicant');
      return { success: false, error: 'No email address found' };
    }

    let subject, html;

    if (status === 'approved') {
      subject = `Application Approved - ${projectTitle} - CareSynce Foundation`;
      html = emailTemplates.applicationApproved(application, reviewedBy, projectTitle);
    } else if (status === 'rejected') {
      subject = `Application Status Update - ${projectTitle} - CareSynce Foundation`;
      html = emailTemplates.applicationRejected(application, reviewedBy, projectTitle, reviewNotes);
    } else {
      return { success: false, error: 'Invalid status for email notification' };
    }

    return await sendEmail(applicantEmail, subject, html);
  } catch (error) {
    console.error('Error in sendApplicationStatusEmail:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('Email configuration error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendEmail,
  sendApplicationStatusEmail,
  testEmailConfig
};