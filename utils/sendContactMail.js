const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendContactMail = async ({ name, email, subject, message }) => {
  const msg = {
    to: 'quickhirehub143@gmail.com',
    from: 'quickhirehub143@gmail.com',
    subject: `New Contact Message: ${subject}`,
    html: `
      <h3>Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `,
  };

  await sgMail.send(msg);
};

module.exports = sendContactMail;
