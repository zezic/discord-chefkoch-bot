const Request = require('request')
const _ = require('lodash')

const username = process.env.GIT_USERNAME
const password = process.env.GIT_ACCESSTOKEN

const makeOptions = (filename, commitmsg, filecontent) => ({
  method: 'PUT',
  url: `https://${username}:${password}@api.github.com/repos/polarity/${filename}`,
  headers: {
    'User-Agent': 'request'
  },
  json: true,
  body: {
    message: commitmsg || 'something is comitted',
    committer: {
      name: process.env.GIT_USERNICK,
      email: process.env.GIT_USERMAIL
    },
    content: filecontent || 'bXkgbmV3IGZpbGUgY29udGVudHM='
  }
})

module.exports = (filename, commitmsg, filecontent) => {
  const options = makeOptions(filename, commitmsg, filecontent)
  try {
    Request(options, (err, res, body) => {
      if (!err) {
        console.log('added: ', _.get(body, 'content.name', '??? not defined name'))
      } else {
        console.log('something went wrong while comitting: ', err)
      }
    })
  } catch (err) {
    console.log('something went wrong while comitting: ', err)
  }
}
