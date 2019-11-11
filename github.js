var Request = require('request')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '/.env') })

const username = process.env.git_username
const password = process.env.git_password

const options = {
  method: 'PUT',
  url: `https://${username}:${password}@api.github.com/repos/polarity/bitwig-community-presets/contents/discord-presets`,
  headers: {
    'User-Agent': 'request'
  },
  json: true,
  body: {
    message: 'something is comitted',
    committer: {
      name: process.env.git_usernick,
      email: process.env.git_usermail
    },
    content: 'bXkgbmV3IGZpbGUgY29udGVudHM='
  }
}

module.exports = (filename, commitmsg, filecontent) => {
  options.url = options.url + '/' + filename
  options.body.message = commitmsg
  options.body.content = filecontent
  Request(options, (err, res, body) => {
    if (!err) {
      console.log(body.content)
    }
  })
}
