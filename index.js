var Discord = require('discord.js')
var mybot = new Discord.Client()
const bwpresets = require('./bwpresets.js')
const bwclips = require('./bwclips.js')

// get all channels
mybot.on('ready', function (data) {
  // const channel = mybot.channels.find(ch => ch.name === 'your presets')
  // channel.sendMessage('Guten Tag!')
})

// act on message
mybot.on('message', function (message) {
  // console.log(message.guild.name, ' - ', message.author.username, '(', message.channel.name, ')', ': ', message.content)
  if (message.channel.name === 'your-presets' && message.author.username !== 'Chefkoch') {
    bwpresets(message)
  }
  if (message.channel.name === 'your-clips' && message.author.username !== 'Chefkoch') {
    bwclips(message)
  }
  if (message.channel.name === 'olisar' && message.author.username !== 'Chefkoch') {
    bwpresets(message)
  }
})

mybot.login(process.env.API_DISCORD_TOKEN, function (err, token) {
  console.log(err, token)
})
