const Http = require('http');
const httpPort = 3838;

const Discord = require('discord.js');

const github = require('./src/github_api');
const validate = require('./src/validate');

const discordToken = process.env.DISCORD_API_TOKEN;
const githubToken = process.env.GITHUB_API_TOKEN;

validate.token(githubToken, discordToken);

// Create an instance of a Discord client
const client = new Discord.Client();

client.on('ready', () => {
  console.log("I'm up!");
});

client.on('message', message => {
  const messageTokens = message.content.split(/ +/);
  if (messageTokens[0] === 'orgbot') {
    if (messageTokens[1] === 'check' && messageTokens.length === 3) {
      github.checkMembership('tory-toolkit', messageTokens[2], resp => {
        message.reply(resp);
      });
    } else if (messageTokens[1] === 'invite' && messageTokens.length === 3) {
      github.inviteMember('tory-toolkit', messageTokens[2], resp => {
        message.reply(resp);
      });
    } else {
      message.reply(`Invalid command. Try
      \`orgbot check USERNAME \` -- check if GitHub user USERNAME is a member of the organisation
      \`orgbot invite USERNAME\` -- invite GitHub user USERNAME to the organisation`);
    }
  }
});

client.on('error', err => {
  console.log(err);
});

client.login(discordToken);

// For setting up uptime robot / monitoring
const monitoringServer = Http.createServer((request, response) => {
  const statuses = {
    0: 'Ready',
    1: 'Connecting',
    2: 'Reconnecting',
    3: 'Idle',
    4: 'Nearly',
    5: 'Disconnected'
  };

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(statuses[client.status]);
  response.end();
});

monitoringServer.listen(httpPort, err => {
  if (err) {
    return console.log('monitoring crashed', err);
  }
  console.log(`monitoring server is listening on ${httpPort}`);
});
