const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendResetEmail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await transporter.sendMail({
    to,
    subject: 'Reset Your VaultBooks Password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  });
};
