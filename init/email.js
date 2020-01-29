const AWS = require('aws-sdk')

const ses = new AWS.SES()

const templates = {
  0: {
    Template: {
      TemplateName: 'ContactUs',
      SubjectPart: 'Thank you for your message!',
      HtmlPart: '<h1>Hello {{name}},</h1><p>Your favorite animal is {{favoriteanimal}}.</p>',
      TextPart: 'Dear {{name}},\r\nYour favorite animal is {{favoriteanimal}}.'
    }
  },
  1: {
    Template: {
      TemplateName: 'NewPassword',
      SubjectPart: 'Thank you for your message!',
      HtmlPart: '<h1>Hello {{name}},</h1><p>Your favorite animal is {{favoriteanimal}}.</p>',
      TextPart: 'Dear {{name}},\r\nYour favorite animal is {{favoriteanimal}}.'
    }
  },
  2: {
    Template: {
      TemplateName: 'Referral',
      SubjectPart: 'Thank you for your message!',
      HtmlPart: '<h1>Hello {{name}},</h1><p>Your favorite animal is {{favoriteanimal}}.</p>',
      TextPart: 'Dear {{name}},\r\nYour favorite animal is {{favoriteanimal}}.'
    }
  },
  3: {
    Template: {
      TemplateName: 'PasswordReset',
      SubjectPart: 'Thank you for your message!',
      HtmlPart: '<h1>Hello {{name}},</h1><p>Your favorite animal is {{favoriteanimal}}.</p>',
      TextPart: 'Dear {{name}},\r\nYour favorite animal is {{favoriteanimal}}.'
    }
  },
  4: {
    Template: {
      TemplateName: 'ConfirmAccount',
      SubjectPart: 'Thank you for your message!',
      HtmlPart: '<h1>Hello {{name}},</h1><p>Your favorite animal is {{favoriteanimal}}.</p>',
      TextPart: 'Dear {{name}},\r\nYour favorite animal is {{favoriteanimal}}.'
    }
  }
}

templates.forEach((template) => {
  ses.createTemplate(template, (err, data) => {
    if (err) console.log(err.message)
    else console.log(data)
  })
})
