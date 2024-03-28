const { convert } = require("html-to-text");

const nodemailer = require("nodemailer");
const process = require("process");
const pug = require("pug");
// const { fileURLToPath } = require("url");
// const { dirname } = require("path");

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(fileURLToPath(import.meta.url));

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = process.env.API_EMAIL_FROM;
    this.firstname = user.name.split(" ")[0];
    this.url = url;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        host: process.env.BREVO_HOST,
        port: process.env.BREVO_PORT,
        auth: {
          user: process.env.BREVO_USERNAME,
          pass: process.env.BREVO_KEY,
        },
      });
    } else {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  async send(template, subject) {
    const html = pug.renderFile(
      // eslint-disable-next-line no-undef
      `${__dirname}/../views/emails/${template}.pug`,
      {
        url: this.url,
        firstname: this.firstname,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async verifyEmail() {
    return this.send("verifyEmail", "Verify Your Email Address for TDLApp 📧");
  }

  async resendVerifyEmail() {
    return this.send(
      "resendVerifyEmail",
      "Verify Your Email Address for TDLApp 📧"
    );
  }
}

// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: "TDLAPP <hello@tdlapp.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   await transporter.sendMail(mailOptions);
// };

module.exports = Email;
