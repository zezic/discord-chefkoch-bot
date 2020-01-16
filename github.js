const Request = require('request')
const _ = require('lodash')

const username = process.env.GIT_USERNAME
const password = process.env.GIT_ACCESSTOKEN

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
      name: process.env.GIT_USERNICK,
      email: process.env.GIT_USERMAIL
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
      console.log('added: ', _.get(body, 'content.name', '??? not defined name'))
    }
  })
}
