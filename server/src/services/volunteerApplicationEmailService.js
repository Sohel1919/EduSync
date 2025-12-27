import nodemailer from 'nodemailer';
import User from '../models/user.model.js';

// Create transporters
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
  applicationSubmitted: (application) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .info-box { background: #f8f9fa; border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 5px solid #667eea; }
        .status-pending { display: inline-block; background: #fff3cd; color: #856404; padding: 8px 20px; border-radius: 50px; font-weight: bold; font-size: 14px; margin: 10px 0; }
        .footer { background: #f8f9fa; padding: 25px 30px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #dee2e6; }
        .btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
        .timeline { margin: 30px 0; }
        .timeline-item { display: flex; align-items: center; margin: 15px 0; }
        .timeline-dot { width: 12px; height: 12px; background: #667eea; border-radius: 50%; margin-right: 15px; }
        .timeline-text { flex: 1; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Volunteer Application Submitted</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">EduSync Foundation</p>
        </div>
        
        <div class="content">
          <h2>Dear ${application.personalInfo?.firstName} ${application.personalInfo?.lastName},</h2>
          
          <p>Thank you for submitting your volunteer application to EduSync Foundation. We appreciate your interest in joining our mission to create positive change in education.</p>
          
          <div class="status-pending">Application Status: PENDING REVIEW</div>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #333;">Application Details</h3>
            <p><strong>Application ID:</strong> ${application._id}</p>
            <p><strong>Applied On:</strong> ${new Date(application.applicationDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Position:</strong> Volunteer - ${application.applicationType === 'project-specific' ? application.projectTitle : 'General Volunteer'}</p>
          </div>
          
          <div class="timeline">
            <h3>What's Next?</h3>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-text">
                <strong>Application Review</strong>
                <p>Our team will review your application within 3-5 business days</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-text">
                <strong>Interview</strong>
                <p>If shortlisted, we'll contact you to schedule an interview</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-text">
                <strong>Onboarding</strong>
                <p>Successful candidates will undergo orientation and training</p>
              </div>
            </div>
          </div>
          
          <p>You can check your application status anytime by logging into your EduSync portal.</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL || 'https://edusync.org'}/dashboard/volunteer-applications" class="btn">View Application Status</a>
          </center>
        </div>
        
        <div class="footer">
          <p>Need help? Contact our support team at <a href="mailto:support@edusync.org" style="color: #667eea;">support@edusync.org</a></p>
          <p>This is an automated message. Please do not reply to this email.</p>
          <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
            &copy; ${new Date().getFullYear()} EduSync Foundation. All rights reserved.<br>
            Empowering Education, Enriching Futures
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  interviewScheduled: (application, interviewDetails, reviewedBy) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .interview-box { background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 15px; padding: 30px; margin: 30px 0; }
        .status-scheduled { display: inline-block; background: #dbeafe; color: #1e40af; padding: 10px 25px; border-radius: 50px; font-weight: bold; font-size: 16px; margin: 15px 0; }
        .footer { background: #f8f9fa; padding: 25px 30px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #dee2e6; }
        .btn { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0; font-size: 16px; }
        .detail-row { display: flex; margin: 12px 0; }
        .detail-label { width: 150px; font-weight: bold; color: #4b5563; }
        .detail-value { flex: 1; color: #1f2937; }
        .instructions-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 Interview Scheduled!</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">EduSync Foundation - Volunteer Program</p>
        </div>
        
        <div class="content">
          <h2>Congratulations ${application.personalInfo?.firstName}!</h2>
          
          <p>We're excited to inform you that your volunteer application has been shortlisted and we'd like to schedule an interview with you.</p>
          
          <div class="status-scheduled">INTERVIEW SCHEDULED</div>
          
          <div class="interview-box">
            <h3 style="margin-top: 0; color: #1e40af;">Interview Details</h3>
            
            <div class="detail-row">
              <div class="detail-label">Date:</div>
              <div class="detail-value">
                <strong>${new Date(interviewDetails.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Time:</div>
              <div class="detail-value">
                <strong>${interviewDetails.time}</strong> (Indian Standard Time)
              </div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Mode:</div>
              <div class="detail-value">
                <strong style="text-transform: capitalize;">${interviewDetails.mode}</strong>
                ${interviewDetails.mode === 'online' ? ' - Virtual Interview' : ' - In-Person Interview'}
              </div>
            </div>
            
            ${interviewDetails.mode === 'online' ? `
            <div class="detail-row">
              <div class="detail-label">Meeting Link:</div>
              <div class="detail-value">
                <a href="${interviewDetails.link}" style="color: #3b82f6; text-decoration: none; font-weight: bold;">
                  ${interviewDetails.link}
                </a>
              </div>
            </div>
            ` : `
            <div class="detail-row">
              <div class="detail-label">Location:</div>
              <div class="detail-value">
                <strong>${interviewDetails.location}</strong>
              </div>
            </div>
            `}
            
            <div class="detail-row">
              <div class="detail-label">Scheduled By:</div>
              <div class="detail-value">
                <strong>${reviewedBy}</strong>
              </div>
            </div>
          </div>
          
          ${interviewDetails.instructions ? `
          <div class="instructions-box">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">Important Instructions</h4>
            <p style="margin: 0; color: #78350f;">${interviewDetails.instructions}</p>
          </div>
          ` : ''}
          
          <h3>Preparation Tips:</h3>
          <ul>
            <li>Please join 5-10 minutes before the scheduled time</li>
            <li>Have your questions ready about our volunteer program</li>
            <li>Be prepared to discuss your skills and motivation</li>
            <li>Test your audio/video setup if it's an online interview</li>
          </ul>
          
          <center>
            ${interviewDetails.mode === 'online' ? `
            <a href="${interviewDetails.link}" class="btn">Join Interview Meeting</a>
            ` : ''}
          </center>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Need to reschedule? Please contact us at least 24 hours in advance at 
            <a href="mailto:volunteer@edusync.org" style="color: #4f46e5;">volunteer@edusync.org</a>
          </p>
        </div>
        
        <div class="footer">
          <p>We look forward to meeting you!</p>
          <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
            &copy; ${new Date().getFullYear()} EduSync Foundation<br>
            Phone: +91-XXXXXXXXXX | Email: volunteer@edusync.org
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  applicationApproved: (application, reviewedBy) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .congrats-box { background: #d1fae5; border: 3px solid #10b981; border-radius: 15px; padding: 35px; margin: 30px 0; text-align: center; }
        .status-approved { display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 50px; font-weight: bold; font-size: 18px; margin: 15px 0; }
        .footer { background: #f8f9fa; padding: 25px 30px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #dee2e6; }
        .btn { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0; font-size: 16px; }
        .next-steps { background: #f0f9ff; border-radius: 10px; padding: 25px; margin: 25px 0; }
        .welcome-badge { font-size: 48px; margin: 20px 0; }
        .credentials-notice { background: #fffbeb; border: 2px solid #fbbf24; border-radius: 10px; padding: 25px; margin: 30px 0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">🎊 Welcome to the Team!</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">EduSync Foundation</p>
        </div>
        
        <div class="content">
          <div class="welcome-badge">🎉</div>
          
          <h2>Congratulations ${application.personalInfo?.firstName} ${application.personalInfo?.lastName}!</h2>
          
          <p>We are thrilled to inform you that your volunteer application has been <strong>APPROVED</strong>!</p>
          
          <div class="congrats-box">
            <div class="status-approved">APPLICATION APPROVED</div>
            <p style="font-size: 18px; margin: 15px 0 0;">Welcome to the EduSync Foundation Volunteer Family!</p>
          </div>
          
          <div class="credentials-notice">
            <h3 style="color: #92400e; margin-top: 0;">📧 Your Login Credentials</h3>
            <p>Your EduSync Volunteer Portal account credentials will be sent to you separately within <strong>2-3 working days</strong>.</p>
            <p><strong>Please check your email (including spam folder) for your login ID and password.</strong></p>
          </div>
          
          <div class="next-steps">
            <h3 style="color: #1e40af; margin-top: 0;">Next Steps:</h3>
            <ol style="padding-left: 20px;">
              <li><strong>Credentials Delivery</strong> - You will receive your login ID and password via email within 2-3 working days</li>
              <li><strong>Portal Access</strong> - Use the provided credentials to access your EduSync Volunteer Dashboard</li>
              <li><strong>Volunteer Orientation</strong> - Complete the mandatory online orientation session</li>
              <li><strong>Documentation</strong> - Submit required documents through the portal</li>
              <li><strong>Training</strong> - Attend role-specific training sessions</li>
              <li><strong>Start Volunteering</strong> - Begin your journey with meaningful contributions!</li>
            </ol>
          </div>
          
          <p><strong>Approval Details:</strong></p>
          <ul>
            <li><strong>Application ID:</strong> ${application._id}</li>
            <li><strong>Approved By:</strong> ${reviewedBy}</li>
            <li><strong>Approval Date:</strong> ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
            <li><strong>Role:</strong> Volunteer - ${application.applicationType === 'project-specific' ? application.projectTitle : 'General Volunteer'}</li>
          </ul>
          
          <p>Our Volunteer Coordinator will contact you within 2 business days with detailed onboarding instructions.</p>
          
          <p style="margin-top: 30px; color: #6b7280;">
            If you don't receive your credentials within 3 working days, please contact our Volunteer Support Team at 
            <a href="mailto:volunteer.support@edusync.org" style="color: #10b981; font-weight: bold;">volunteer.support@edusync.org</a>
          </p>
        </div>
        
        <div class="footer">
          <p style="font-size: 16px; color: #374151; font-weight: bold;">
            Thank you for choosing to make a difference with EduSync Foundation!
          </p>
          <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
            &copy; ${new Date().getFullYear()} EduSync Foundation. All rights reserved.<br>
            Empowering Education, Enriching Futures
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  applicationRejected: (application, reviewedBy, rejectionReason) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .status-box { background: #fef2f2; border: 2px solid #ef4444; border-radius: 15px; padding: 30px; margin: 30px 0; }
        .status-rejected { display: inline-block; background: #ef4444; color: white; padding: 10px 25px; border-radius: 50px; font-weight: bold; font-size: 16px; margin: 15px 0; }
        .footer { background: #f8f9fa; padding: 25px 30px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #dee2e6; }
        .btn { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0; font-size: 16px; }
        .reason-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px; }
        .encouragement { background: #dbeafe; border-radius: 10px; padding: 25px; margin: 30px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Application Status Update</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">EduSync Foundation Volunteer Program</p>
        </div>
        
        <div class="content">
          <h2>Dear ${application.personalInfo?.firstName} ${application.personalInfo?.lastName},</h2>
          
          <p>Thank you for taking the time to apply for a volunteer position at EduSync Foundation. We appreciate your interest in joining our mission.</p>
          
          <div class="status-box">
            <div class="status-rejected">APPLICATION STATUS: NOT SELECTED</div>
            <p>After careful consideration of all applications received, we regret to inform you that your application has not been selected for this volunteer opportunity.</p>
          </div>
          
          ${rejectionReason ? `
          <div class="reason-box">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">Feedback from our team:</h4>
            <p style="margin: 0; color: #78350f;">${rejectionReason}</p>
          </div>
          ` : ''}
          
          <div class="encouragement">
            <h3 style="color: #1e40af; margin-top: 0;">Keep Making a Difference!</h3>
            <p>While you were not selected for this specific opportunity, we encourage you to:</p>
            <ul>
              <li>Apply for other volunteer positions that match your skills</li>
              <li>Consider different types of involvement (remote, project-based, event-based)</li>
              <li>Stay connected with us through our newsletter and social media</li>
              <li>Reapply in the future as new opportunities arise</li>
            </ul>
          </div>
          
          <p><strong>Application Details:</strong></p>
          <ul>
            <li><strong>Application ID:</strong> ${application._id}</li>
            <li><strong>Reviewed By:</strong> ${reviewedBy}</li>
            <li><strong>Review Date:</strong> ${new Date().toLocaleDateString('en-IN')}</li>
            <li><strong>Position Applied:</strong> ${application.applicationType === 'project-specific' ? application.projectTitle : 'General Volunteer'}</li>
          </ul>
          
          <p>We sincerely appreciate your interest in volunteering with us and hope you'll consider other opportunities to collaborate in the future.</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL || 'https://edusync.org'}/volunteer" class="btn">Explore Other Opportunities</a>
          </center>
        </div>
        
        <div class="footer">
          <p>Thank you for your commitment to education transformation.</p>
          <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
            &copy; ${new Date().getFullYear()} EduSync Foundation<br>
            Email: volunteer@edusync.org | Website: www.edusync.org
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  applicationDeleted: (application, reviewedBy, reason) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff; }
        .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .alert-box { background: #fef2f2; border: 2px solid #dc2626; border-radius: 15px; padding: 30px; margin: 30px 0; text-align: center; }
        .footer { background: #f8f9fa; padding: 25px 30px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #dee2e6; }
        .contact-info { background: #f0f9ff; border-radius: 10px; padding: 20px; margin: 25px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Application Status Update</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">EduSync Foundation</p>
        </div>
        
        <div class="content">
          <h2>Dear ${application.personalInfo?.firstName} ${application.personalInfo?.lastName},</h2>
          
          <p>This email is to inform you about an important update regarding your volunteer application.</p>
          
          <div class="alert-box">
            <h3 style="color: #dc2626; margin-top: 0;">⚠️ Application Withdrawn</h3>
            <p>Your volunteer application (ID: ${application._id}) has been withdrawn from our system.</p>
            
            ${reason ? `
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
              <strong>Reason:</strong> ${reason}
            </div>
            ` : ''}
          </div>
          
          <p><strong>Details:</strong></p>
          <ul>
            <li><strong>Application ID:</strong> ${application._id}</li>
            <li><strong>Action By:</strong> ${reviewedBy}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
            <li><strong>Position:</strong> ${application.applicationType === 'project-specific' ? application.projectTitle : 'General Volunteer'}</li>
          </ul>
          
          <div class="contact-info">
            <p><strong>Need clarification or have questions?</strong></p>
            <p>Please contact our volunteer support team:</p>
            <p>
              Email: <a href="mailto:support@edusync.org" style="color: #3b82f6;">support@edusync.org</a><br>
              Phone: +91-XXXXXXXXXX
            </p>
          </div>
          
          <p>We appreciate your interest in volunteering with EduSync Foundation and hope to see you apply for future opportunities.</p>
        </div>
        
        <div class="footer">
          <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
            &copy; ${new Date().getFullYear()} EduSync Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  credentialsEmail: (application, username, password) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .credentials-box { background: #f0f9ff; border: 3px solid #3b82f6; border-radius: 15px; padding: 35px; margin: 30px 0; }
        .credential-row { display: flex; margin: 15px 0; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #10b981; }
        .credential-label { width: 150px; font-weight: bold; color: #1e40af; }
        .credential-value { flex: 1; font-family: 'Courier New', monospace; font-size: 16px; color: #1f2937; background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px dashed #cbd5e1; }
        .security-notice { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px; }
        .footer { background: #f8f9fa; padding: 25px 30px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #dee2e6; }
        .btn { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0; font-size: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">🔐 Your EduSync Portal Access</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Volunteer Dashboard Credentials</p>
        </div>
        
        <div class="content">
          <h2>Dear ${application.personalInfo?.firstName} ${application.personalInfo?.lastName},</h2>
          
          <p>As per our previous approval email, here are your login credentials for the EduSync Volunteer Portal.</p>
          
          <div class="credentials-box">
            <h3 style="margin-top: 0; color: #1e40af; text-align: center;">Your Login Details</h3>
            
            <div class="credential-row">
              <div class="credential-label">Portal URL:</div>
              <div class="credential-value">
                ${process.env.FRONTEND_URL || 'https://edusync.org'}/login
              </div>
            </div>
            
            <div class="credential-row">
              <div class="credential-label">Username/Email:</div>
              <div class="credential-value">
                ${username}
              </div>
            </div>
            
            <div class="credential-row">
              <div class="credential-label">Password:</div>
              <div class="credential-value">
                ${password}
              </div>
            </div>
          </div>
          
          <div class="security-notice">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">⚠️ Security Notice</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Keep your credentials confidential</li>
              <li>Change your password after first login</li>
              <li>Do not share these details with anyone</li>
              <li>Contact support immediately if you suspect unauthorized access</li>
            </ul>
          </div>
          
          <h3>First-Time Login Instructions:</h3>
          <ol style="padding-left: 20px;">
            <li>Visit the portal login page: <a href="${process.env.FRONTEND_URL || 'https://edusync.org'}/login">${process.env.FRONTEND_URL || 'https://edusync.org'}/login</a></li>
            <li>Enter your username/email and temporary password provided above</li>
            <li>Complete the mandatory password change process</li>
            <li>Review and accept the volunteer agreement</li>
            <li>Complete your profile setup</li>
            <li>Access your dashboard and start exploring volunteer opportunities!</li>
          </ol>
          
          <center>
            <a href="${process.env.FRONTEND_URL || 'https://edusync.org'}/login" class="btn">Go to Login Page</a>
          </center>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            <strong>Need Help?</strong><br>
            If you encounter any issues logging in, please contact our technical support:<br>
            Email: <a href="mailto:tech.support@edusync.org" style="color: #3b82f6;">tech.support@edusync.org</a><br>
            Phone: +91-XXXXXXXXXX (Mon-Fri, 9 AM - 6 PM)
          </p>
        </div>
        
        <div class="footer">
          <p style="font-size: 16px; color: #374151; font-weight: bold;">
            Welcome to EduSync Foundation!
          </p>
          <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
            &copy; ${new Date().getFullYear()} EduSync Foundation. All rights reserved.<br>
            Empowering Education, Enriching Futures
          </p>
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
      from: `"EduSync Foundation - Volunteer Program" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      replyTo: process.env.VOLUNTEER_SUPPORT_EMAIL || 'volunteer@edusync.org'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Volunteer email sent successfully to:', to, 'Message ID:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending volunteer email to:', to, 'Error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send application submitted confirmation
export const sendApplicationSubmittedEmail = async (application) => {
  try {
    const applicantEmail = application.contactInfo?.email;
    
    if (!applicantEmail) {
      console.error('No email address found for applicant');
      return { success: false, error: 'No email address found' };
    }

    const subject = `Volunteer Application Submitted - EduSync Foundation`;
    const html = emailTemplates.applicationSubmitted(application);
    
    return await sendEmail(applicantEmail, subject, html);
  } catch (error) {
    console.error('Error in sendApplicationSubmittedEmail:', error);
    return { success: false, error: error.message };
  }
};

// Send interview scheduled email
export const sendInterviewScheduledEmail = async (application, interviewDetails, reviewedBy) => {
  try {
    const applicantEmail = application.contactInfo?.email;
    
    if (!applicantEmail) {
      console.error('No email address found for applicant');
      return { success: false, error: 'No email address found' };
    }

    const interviewDate = new Date(interviewDetails.date);
    const formattedDate = interviewDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const subject = `Interview Scheduled - ${formattedDate} - EduSync Foundation`;
    const html = emailTemplates.interviewScheduled(application, interviewDetails, reviewedBy);
    
    return await sendEmail(applicantEmail, subject, html);
  } catch (error) {
    console.error('Error in sendInterviewScheduledEmail:', error);
    return { success: false, error: error.message };
  }
};

// Send application approved email
export const sendApplicationApprovedEmail = async (application, reviewedBy) => {
  try {
    const applicantEmail = application.contactInfo?.email;
    
    if (!applicantEmail) {
      console.error('No email address found for applicant');
      return { success: false, error: 'No email address found' };
    }

    const subject = `🎉 Welcome to EduSync Foundation - Volunteer Application Approved!`;
    const html = emailTemplates.applicationApproved(application, reviewedBy);
    
    return await sendEmail(applicantEmail, subject, html);
  } catch (error) {
    console.error('Error in sendApplicationApprovedEmail:', error);
    return { success: false, error: error.message };
  }
};

// Send credentials email (separate email for credentials)
export const sendCredentialsEmail = async (application, username, password) => {
  try {
    const applicantEmail = application.contactInfo?.email;
    
    if (!applicantEmail) {
      console.error('No email address found for applicant');
      return { success: false, error: 'No email address found' };
    }

    const subject = `🔐 Your EduSync Volunteer Portal Access Credentials`;
    const html = emailTemplates.credentialsEmail(application, username, password);
    
    return await sendEmail(applicantEmail, subject, html);
  } catch (error) {
    console.error('Error in sendCredentialsEmail:', error);
    return { success: false, error: error.message };
  }
};

// Send application rejected email
export const sendApplicationRejectedEmail = async (application, reviewedBy, rejectionReason) => {
  try {
    const applicantEmail = application.contactInfo?.email;
    
    if (!applicantEmail) {
      console.error('No email address found for applicant');
      return { success: false, error: 'No email address found' };
    }

    const subject = `Update on Your Volunteer Application - EduSync Foundation`;
    const html = emailTemplates.applicationRejected(application, reviewedBy, rejectionReason);
    
    return await sendEmail(applicantEmail, subject, html);
  } catch (error) {
    console.error('Error in sendApplicationRejectedEmail:', error);
    return { success: false, error: error.message };
  }
};

// Send application deleted email
export const sendApplicationDeletedEmail = async (application, reviewedBy, reason) => {
  try {
    const applicantEmail = application.contactInfo?.email;
    
    if (!applicantEmail) {
      console.error('No email address found for applicant');
      return { success: false, error: 'No email address found' };
    }

    const subject = `Important: Your Volunteer Application Status - EduSync Foundation`;
    const html = emailTemplates.applicationDeleted(application, reviewedBy, reason);
    
    return await sendEmail(applicantEmail, subject, html);
  } catch (error) {
    console.error('Error in sendApplicationDeletedEmail:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
export const testVolunteerEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Volunteer email configuration is valid');
    return { success: true, message: 'Volunteer email configuration is valid' };
  } catch (error) {
    console.error('Volunteer email configuration error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendEmail,
  sendApplicationSubmittedEmail,
  sendInterviewScheduledEmail,
  sendApplicationApprovedEmail,
  sendCredentialsEmail, 
  sendApplicationRejectedEmail,
  sendApplicationDeletedEmail,
  testVolunteerEmailConfig
};