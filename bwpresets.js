var Request = require('request')
const fs = require('fs')
const path = require('path')
var _ = require('lodash')
const commitGit = require('./github')
require('dotenv').config({ path: path.join(__dirname, '/.env') })

const messageThxTxt = 'thanks for your submission, preset is downloaded and will be available on git here: https://github.com/polarity/bitwig-community-presets'
const messageWarnTxt = 'Hey please upload only .bwpreset files to this channel. 🔥 The messages will be deleted in 20 secs 🔥'
const messageNoAttTxt = 'Hey please upload .bwpreset files to this channel. If you want to upload videos, or zip files the use the #💾-resources channel! 🔥 The messages will be deleted in 20 secs 🔥'
const timeoutMessages = 20000

const download = (url, dest, cb) => {
  var file = fs.createWriteStream(dest)
  Request.get(url, () => { file.close(cb) }).pipe(file)
}

module.exports = (message) => {
  if (message.attachments && _.size(message.attachments) > 0) {
    message.attachments.tap(attachment => {
      // has the file a bwpreset in the filename?
      if (attachment.filename.match(/\.bwpreset/i)) {
        // all presets go into a username sub directory
        const downloadPath = path.join(__dirname, './downloads/', message.author.id, '/')
        // create the dir when no available
        if (!fs.existsSync(downloadPath)) {
          fs.mkdirSync(downloadPath)
        }

        // get file and send it to the repo
        Request.get({ encoding: null, url: attachment.url }, (error, response, body) => {
          if (!error) {
            const buffer = Buffer.from(body).toString('base64')
            // const data = 'data:' + response.headers['content-type'] + ';base64,' + buffer
            commitGit(message.author.id + '/' + attachment.filename, message.content, buffer)
          } else {
            console.log('error requesting the file: ', error)
          }
        })

        // should we download the file locally?
        if (process.env.download) {
          // download to disk
          download(attachment.url, path.join(downloadPath, attachment.filename))
        }

        const thxMessage = message.reply(messageThxTxt)

        // delete the messages after 20secs
        setTimeout(() => {
          thxMessage.then(msg => msg.delete())
        }, timeoutMessages)
      } else {
        // file is not a bwpreset file
        const warnMessage = message.reply(messageWarnTxt)
        // delete the messages after 20secs
        setTimeout(() => {
          warnMessage.then(msg => msg.delete())
          message.delete().then(msg => console.log('message deleted!'))
        }, timeoutMessages)
      }
    })
  } else {
    const warnMessage = message.reply(messageNoAttTxt)
    // delete the messages after 20secs
    setTimeout(() => {
      warnMessage.then(msg => msg.delete())
      message.delete().then(msg => console.log('message deleted!'))
    }, timeoutMessages)
  }
}
