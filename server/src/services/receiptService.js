import PDFDocument from 'pdfkit';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Generate education donation receipt PDF
// @route   Internal
// @access  Private
const generateReceipt = async (paymentData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        try {
          const pdfData = Buffer.concat(buffers);
          // Upload to Cloudinary or save to file system
          const uploadResult = await uploadToCloudinary(pdfData, 'education-receipts');
          resolve(uploadResult.secure_url);
        } catch (uploadError) {
          reject(uploadError);
        }
      });

      // Add content to PDF
      addReceiptContent(doc, paymentData);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// @desc    Add content to education receipt PDF
// @route   Internal
// @access  Private
const addReceiptContent = (doc, paymentData) => {
  const { donation, donorInfo } = paymentData;
  
  // Header
  doc.fontSize(20).font('Helvetica-Bold')
     .fillColor('#2563eb')
     .text('EduSync - Education for All', 50, 50)
     .fontSize(10)
     .fillColor('#666666')
     .text('Empowering Underprivileged Students Through Education', 50, 75)
     .text('80G Certificate No: EDU/80G/456/2024', 50, 90);

  // Title
  doc.fontSize(16).fillColor('#000000')
     .text('EDUCATION DONATION RECEIPT', 50, 120, { align: 'center' });

  // Separator
  doc.moveTo(50, 150).lineTo(550, 150).strokeColor('#cccccc').lineWidth(1).stroke();

  // Receipt Details
  let yPosition = 170;

  const details = [
    { label: 'Receipt No', value: `EDU-${donation._id.toString().slice(-8).toUpperCase()}` },
    { label: 'Date', value: new Date().toLocaleDateString('en-IN') },
    { label: 'Payment ID', value: donation.razorpay_payment_id },
    { label: 'Order ID', value: donation.razorpay_order_id },
    { label: 'Education Program', value: donation.causeName },
    { label: 'Amount', value: `₹${donation.amount.toLocaleString('en-IN')}` },
    { label: 'Payment Method', value: donation.payment_method || 'Razorpay' }
  ];

  // Education Supporter Information
  if (!donorInfo.isAnonymous) {
    doc.fontSize(12).font('Helvetica-Bold').text('Education Supporter Information:', 50, yPosition);
    yPosition += 20;
    
    details.push(
      { label: 'Name', value: donorInfo.name },
      { label: 'Email', value: donorInfo.email },
      { label: 'Phone', value: donorInfo.phone }
    );
  } else {
    details.push({ label: 'Supporter', value: 'Anonymous Education Champion' });
  }

  // Print details
  details.forEach((detail, index) => {
    if (index === 0) yPosition += 10;
    
    doc.fontSize(10).font('Helvetica-Bold').text(detail.label + ':', 50, yPosition);
    doc.font('Helvetica').text(detail.value, 200, yPosition);
    yPosition += 20;
  });

  // Impact message
  yPosition += 20;
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#2563eb')
     .text('Your donation creates educational opportunities!', 50, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.fontSize(10).font('Helvetica').fillColor('#666666')
     .text('Your contribution helps provide scholarships, digital learning resources, and study materials to deserving students.', 50, yPosition, { align: 'center', width: 500 });

  // Footer
  const footerY = 700;
  doc.fontSize(8).fillColor('#999999')
     .text('EduSync NGO • Registered Education Charity • www.edusync.org', 50, footerY, { align: 'center' })
     .text('This is a computer-generated education donation receipt. No signature required.', 50, footerY + 12, { align: 'center' });
};

export {
  generateReceipt,
  addReceiptContent
};