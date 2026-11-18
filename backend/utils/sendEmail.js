const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' or configure SMTP host/port based on your provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.EMAIL_USER}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html // Optional: if you pass HTML
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
