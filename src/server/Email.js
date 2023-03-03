import nodemailer from 'nodemailer';

import { email } from '../../config.js';

const transporter = nodemailer.createTransport({ service: email.service, auth: { user: email.username, pass: email.password } });

export const sendEmail = (recipient, subject, content) => {
	return new Promise((resolve, reject) => {
		const mailOptions = { from: email.username, to: recipient, subject: subject, text: content };
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) reject(error);
			else resolve(info);
		});
	});
};
