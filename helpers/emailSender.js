const sgMail = require('@sendgrid/mail')
const MailGen = require('mailgen')
require('dotenv').config()

const sendEmail = async (verifyToken, email, name) => {
  const environment = process.env.NODE_ENV
  let link = ''
  const baseUrl = (environment) => {
    switch (environment) {
      case 'development':
        link = process.env.DEV_URL
        break
      case 'production':
        link = process.env.PROD_URL
        break
      default:
        link = process.env.DEV_URL
        break
    }
    return link
  }
  const mailGenerator = new MailGen({
    theme: 'default',
    product: {
      // Appears in header & footer of e-mails
      name: 'Contacts app',
      link: baseUrl(environment)
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    }
  })
  const template = {
    body: {
      name,
      intro: 'Welcome to Contacts app! We\'re very excited to have you on board.',
      action: {
        instructions: 'To confirm your account in Contacts app, please click here:',
        button: {
          color: '#22BC66',
          text: 'Confirm your account',
          link: `https://pnvm-phone-book-app.netlify.app/email-verify/${verifyToken}`
        }
      },
      outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
  }
  const letter = mailGenerator.generate(template)

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    to: email, // Change to your recipient
    from: 'pnevmat01@ukr.net', // Change to your verified sender
    subject: 'Hey! Klick here to verify your email in Contacts app!',
    html: letter,
  }
  await sgMail.send(msg)
}

module.exports = { sendEmail }
