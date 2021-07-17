var Discord = require('discord.js')
var mybot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD'] })
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

// grant roles for user, when adding a reaction to a post
mybot.on('messageReactionAdd', async (MessageReaction, user) => {
  if (MessageReaction.partial) await MessageReaction.fetch()
  if (MessageReaction.message.partial) await MessageReaction.message.fetch()
  if (MessageReaction.message.guild.partial) await MessageReaction.message.guild.fetch()
  await MessageReaction.users.fetch()

  if (MessageReaction.message.channel.name === 'role-assignements') {
    const roleName = MessageReaction.message.content.split(' - ')[0]
    const role = MessageReaction.message.guild.roles.cache.find(r => r.name === roleName)
    const member = MessageReaction.message.guild.member(user)

    if (role) {
    // add role to user
      member.roles.add(role).then((data) => {
        console.log(user.username, ' added role of ', role.name)
      }).catch((err) => {
        console.log('no role could be added for ', user.username, ' we got error: ', err)
      })
    } else {
      console.log('no role found with the name of: ', roleName)
    }
  }
})

// remove roles for user, when removing a reaction to a post
mybot.on('messageReactionRemove', async (MessageReaction, user) => {
  if (MessageReaction.partial) await MessageReaction.fetch()
  if (MessageReaction.message.partial) await MessageReaction.message.fetch()
  if (MessageReaction.message.guild.partial) await MessageReaction.message.guild.fetch()
  await MessageReaction.users.fetch()

  if (MessageReaction.message.channel.name === 'role-assignements') {
    const roleName = MessageReaction.message.content.split(' - ')[0]
    const role = MessageReaction.message.guild.roles.cache.find(r => r.name === roleName)
    const member = MessageReaction.message.guild.member(user)

    if (role) {
    // remove role from user
      member.roles.remove(role).then((data) => {
        console.log(user.username, ' removed role of ', role.name)
      }).catch((err) => {
        console.log('no role could be removed for ', user.username, ' we got error: ', err)
      })
    } else {
      console.log('no role found with the name of: ', roleName)
    }
  }
})

// act on message
mybot.on('message', function (message) {
  // check for bangs in your presets channel
  if (message.channel.name === 'your-presets' && message.content.match(/!bwp:([\w-.]*.bwpreset)/i)) {
    bangBwp(message)
  }
  // don't react to self-produced messages
  if (message.author.username == 'Chefkoch') {
    return
  }
  // your presets
  if (message.channel.name === 'your-presets') {
    bwpresets(message)
  }
  // your presets
  if (message.channel.name === 'olisar') {
    console.log('message ', message)
    bwpresets(message)
  }

  if (message.channel.name === 'your-releases' && message.attachments && (_.size(message.attachments) > 1 || !message.content.includes('http') || !message.content.includes('bandcamp'))) {
    const warnMessage = message.reply('In this channel are only bandcamp links allowed. So post your bandcamp release and if you want to post feedback to other tracks, please use #your-tunes-chat - message will be deleted soon!')
    // delete the messages after 20secs
    setTimeout(() => {
      warnMessage.then(msg => msg.delete())
      message.delete().then(msg => console.log('message deleted!'))
    }, timeoutMessages)
  }

  if (message.channel.name === 'your-tunes' && message.attachments && _.size(message.attachments) < 1 && !message.content.includes('http')) {
    const warnMessage = message.reply('if you want to post feedback, please use #your-tunes-chat - message will be deleted soon!')
    // delete the messages after 20secs
    setTimeout(() => {
      warnMessage.then(msg => msg.delete())
      message.delete().then(msg => console.log('message deleted!'))
    }, timeoutMessages)
  }

  if (message.channel.name === 'your-tunes-chat' && ((message.attachments && _.size(message.attachments) > 0) || message.content.includes('http'))) {
    const warnMessage = message.reply('if you want to post a track, please use #your-tunes - message will be deleted soon!')
    // delete the messages after 20secs
    setTimeout(() => {
      warnMessage.then(msg => msg.delete())
      message.delete().then(msg => console.log('message deleted!'))
    }, timeoutMessages)
  }

  // console.log(message.guild.name, ' - ', message.author.username, '(', message.channel.name, ')', ': ', message.content)
  if (message.channel.name === 'your-presets') {
    bwpresets(message)
  }
  if (message.channel.name === 'your-clips') {
    bwclips(message)
  }
})

mybot.login(process.env.API_DISCORD_TOKEN, function (err, token) {
  console.log(err, token)
})
