var Discord = require('discord.js')
var mybot = new Discord.Client()
const bwpresets = require('./bwpresets.js')
const bwclips = require('./bwclips.js')
const bangBwp = require('./bang-bwp.js')
var _ = require('lodash')
const timeoutMessages = 20000

// get all channels
mybot.on('ready', function (data) {
  // const channel = mybot.channels.find(ch => ch.name === 'your presets')
  // channel.sendMessage('Guten Tag!')
})

mybot.on('messageReactionAdd', (MessageReaction) => {
  if (MessageReaction.message.channel.name === 'olisar') {
    console.log('coool', MessageReaction)
    MessageReaction.message.reply('coool')
  }
})

// act on message
mybot.on('message', function (message) {
  // check for bangs in your presets channel
  if (message.channel.name === 'your-presets' && message.content.match(/!bwp:([\w-.]*.bwpreset)/i)) {
    bangBwp(message)
  }

  // console.log(message.guild.name, ' - ', message.author.username, '(', message.channel.name, ')', ': ', message.content)
  if (message.channel.name === 'your-tunes' && message.author.username !== 'Chefkoch' && message.attachments && _.size(message.attachments) < 1 && !message.content.includes('http')) {
    const warnMessage = message.reply('if you want to post feedback, please use #your-tunes-chat - message will be deleted soon!')
    // delete the messages after 20secs
    setTimeout(() => {
      warnMessage.then(msg => msg.delete())
      message.delete().then(msg => console.log('message deleted!'))
    }, timeoutMessages)
  }

  if (message.channel.name === 'your-tunes-chat' && message.author.username !== 'Chefkoch' && ((message.attachments && _.size(message.attachments) > 0) || message.content.includes('http'))) {
    const warnMessage = message.reply('if you want to post a track, please use #your-tunes - message will be deleted soon!')
    // delete the messages after 20secs
    setTimeout(() => {
      warnMessage.then(msg => msg.delete())
      message.delete().then(msg => console.log('message deleted!'))
    }, timeoutMessages)
  }

  // console.log(message.guild.name, ' - ', message.author.username, '(', message.channel.name, ')', ': ', message.content)
  if (message.channel.name === 'your-presets' && message.author.username !== 'Chefkoch' && message.attachments && _.size(message.attachments) > 0) {
    bwpresets(message)
  }
  if (message.channel.name === 'your-clips' && message.author.username !== 'Chefkoch' && message.attachments && _.size(message.attachments) > 0) {
    bwclips(message)
  }

  if (message.channel.name === 'olisar' && message.author.username !== 'Chefkoch' && message.attachments && _.size(message.attachments) < 1 && !message.content.includes('http')) {
    message.reply('if you want to post a track, please use #your-tunes - message will be deleted soon!')
  }
})

mybot.login(process.env.API_DISCORD_TOKEN, function (err, token) {
  console.log(err, token)
})
