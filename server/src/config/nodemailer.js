import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // Use STARTTLS
    tls: {
        ciphers: 'SSLv3' // You can try adding this line
    },
    auth: {
        user: process.env.SMTP_USER, // Your Brevo email address
        pass: process.env.SMTP_PASSWORD, // Your Brevo SMTP password
    }
});

export default transporter;