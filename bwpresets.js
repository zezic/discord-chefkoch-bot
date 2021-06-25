var Request = require('request')
const fs = require('fs')
const path = require('path')
var _ = require('lodash')
const commitGit = require('./github')

const saveToFirebase = require('./firebase').save
const storeImage = require('./firebase').storeImage

const messageThxTxt = 'Thanks for your submission 🎉🎉, preset is downloaded and will be available on git here: https://github.com/polarity/bitwig-community-presets also listed soon on https://bitwig.community/presets'
const messageWarnTxt = 'Hey, please upload only .bwpreset files to this channel. Dont forget to add a nice description! 🔥 The messages will be deleted in 20 secs 🔥'
const messageNoAttTxt = 'Hey, please upload only .bwpreset files to this channel. Dont forget to add a nice description! If you want to upload videos, or zip files, use the #💾-resources channel! 🔥 The messages will be deleted in 20 secs 🔥'
const timeoutMessages = 20000

const download = (url, dest, cb) => {
  var file = fs.createWriteStream(dest)
  Request.get(url, () => { file.close(cb) }).pipe(file)
}

module.exports = (message) => {
  if (message.attachments && _.size(message.attachments) > 0) {
    message.attachments.each(attachment => {
      // has the file a bwpreset in the filename?
      if (attachment.name.match(/\.bwpreset/i)) {
        // get file and send it to the repo
        Request.get({ encoding: null, url: attachment.url }, async (error, response, body) => {
          if (!error) {
            const buffer = Buffer.from(body, 'binary').toString('base64')

            // const data = 'data:' + response.headers['content-type'] + ';base64,' + buffer
            commitGit('bitwig-community-presets/contents/discord-presets/' + message.author.id + '/' + attachment.name, message.content, buffer)

            // get the discord avatar url
            const imageURL = message.author.avatarURL({ format: 'png', dynamic: true, size: 1024 }) || ''

            // download the discord avatar and add it to the firestore, return the new firestor url
            const imageFirebaseURL = await storeImage(message.author.id, message.author.username, imageURL)

            // construct data
            const doc = {
              added: new Date().toISOString(),
              desc: message.content,
              download: 'https://github.com/polarity/bitwig-community-presets/raw/master/discord-presets/' + message.author.id + '/' + attachment.name,
              name: attachment.name,
              type: 'bwpreset',
              user: {
                firebaseUrl: imageFirebaseURL,
                avatarURL: imageURL || '',
                id: message.author.id,
                username: message.author.username
              }
            }
            // save a new entry to the firebase
            saveToFirebase(doc)
          } else {
            console.log('error requesting the file: ', error)
          }
        })

        // should we download the file locally?
        if (process.env.DOWNLOAD && process.env.DOWNLOAD === 'true') {
          // all presets go into a username sub directory
          const downloadPath = path.join(__dirname, './downloads/', message.author.id, '/')
          // create the dir when no available
          if (!fs.existsSync(downloadPath)) {
            fs.mkdirSync(downloadPath)
          }
          // download to disk
          download(attachment.url, path.join(downloadPath, attachment.name))
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
          message
            .delete()
            .then(msg => console.log('message deleted!'))
            .catch(msg => console.log('-> deletion failed (permissions?)'))
        }, timeoutMessages)
      }
    })
  } else {
    const warnMessage = message.reply(messageNoAttTxt)
    // delete the messages after 20secs
    setTimeout(() => {
      warnMessage.then(msg => msg.delete())
      message
        .delete()
        .then(msg => console.log('message deleted!'))
        .catch(msg => console.log('-> deletion failed (permissions?)'))
    }, timeoutMessages)
  }
}
