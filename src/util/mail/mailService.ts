import sgMail from "@sendgrid/mail";

// Sends an email to specified recipient with specified sender credentials and specified content
export const sendEmail = (sender, recipient, subject, content) => {
  const msg = {
    to: recipient,
    from: sender,
    subject: subject,
    text: content
  };

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  sgMail.send(msg, false, (error) => {
    if (error) {
      console.log(`Email for ${recipient} failed:`);
      console.log(error);
    }
  });
};