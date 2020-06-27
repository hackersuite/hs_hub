import sgMail from '@sendgrid/mail';

// Sends an email to specified recipient with specified sender credentials and specified content
export const sendEmail = (sender: string, recipient: string|string[], subject: string, content: string) => {
	const msg = {
		to: recipient,
		from: sender,
		subject: subject,
		text: content
	};

	sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');

	void sgMail.send(msg, false, (error?: Error) => {
		if (error) {
			console.log(`Email for ${recipient.toString()} failed:`);
			console.log(error);
		}
	});
};
