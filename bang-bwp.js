const saveToFirebase = require('./firebase').save
const loadFromFirebase = require('./firebase').load
const timeoutMessages = 20000
let replyMessage = ''

module.exports = async (message) => {
  // is someone trying to add a video for the preset?
  const bangPresetName = message.content.match(/!bwp:([\w-.]*.bwpreset)/i)
  // is a youtube link delivered?
  const bangPresetYoutubeUrl = message.content.match(/!yt:(https:\/\/[\w/.\-?=]*)/i)

  // when we have preset meta data
  if (bangPresetName) {
    if (bangPresetYoutubeUrl) {
      const doc = {
        name: bangPresetName[1],
        user: {
          id: message.author.id
        },
        videoYoutube: bangPresetYoutubeUrl[1]
      }
      if (await loadFromFirebase(doc)) {
        console.log('doc present! merging object!')
        saveToFirebase(doc)
        replyMessage = 'Thank you, meta data will be added to the preset!'
      } else {
        replyMessage = 'sorry preset not present or you are not the owner of the preset.'
      }
    } else {
      replyMessage = 'yt link not valid'
    }
  } else {
    replyMessage = 'preset name not valid or present'
  }

  const reply = message.reply(replyMessage)

  // delete the messages after 20secs
  setTimeout(() => {
    reply.then(msg => msg.delete())
    message.delete()
      .then(msg => console.log('message deleted!'))
      .catch((err) => console.log('cant delete msg: ', err))
  }, timeoutMessages)
}
