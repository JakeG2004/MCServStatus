//Load required libraries etc
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token, serverIP } = require('./config.json');
const mcsrvstat = require('mcsrvstat-wrapper');

//Define client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//Define command collection
client.commands = new Collection();

//Load command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

//Register command files
for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

	//If command is valid, add it to list of commands
	if('data' in command && 'execute' in command){
		client.commands.set(command.data.name, command);
	} else {
		console.log('[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.');
	}

}

//Handles commands
client.on(Events.InteractionCreate, async interaction => {
	//Return if not slash command
	if(!interaction.isChatInputCommand()) return;

	//Gets command from message
	const command = interaction.client.commands.get(interaction.commandName);

	//If slash command is not accurate
	if(!command){
		console.error('No command matching ${interaction.commandName} was found.');
		return;
	}

	try{
		//Try to run command
		await command.execute(interaction);
	} catch (error){

		//Command failed
		console.error(error);
		
		//Command already handled
		if(interaction.replied || interaction.deferred) {
			await interaction.followUp({content: 'There was an error while executing this command', ephemeral: true});
		} else {
			await interaction.reply({content: 'There was an error while executing this command', ephemeral: true});
		}
	}
});

//Requirements for scheduler etc...
var cron = require("cron");
const date = new Date();

//Run scheduler
let updater = new cron.CronJob('* * * * *', () => {
        setinfo();
});

async function setinfo(){
	//Get data from server
        await mcsrvstat.fetchJavaServer(serverIP);

	//If server is up
        if (mcsrvstat.status === true) {
		//Bot description
                if(mcsrvstat.oPlayers != 1){
                        client.user.setActivity(` with my ${mcsrvstat.oPlayers} friends on ${serverIP}!`)
                }
                else{   
                        client.user.setActivity(` with my ${mcsrvstat.oPlayers} friend on ${serverIP}!`)
                }
        }

	//Server is down
        else{   
                client.user.setActivity("Touching grass");
        }
}

//Bot boot up
client.on(Events.ClientReady, async () => {
  //login notif
  console.log(`Logged in as ${client.user.tag}!`);
  //get data from mcservstat 
  await mcsrvstat.fetchJavaServer(serverIP);

  //if online set pfp
  if (mcsrvstat.status === true) {
	client.user.setAvatar(`https://api.mcsrvstat.us/icon/${serverIP}`);
  }
  
  //set info and start scheduled messages
  setinfo();
  updater.start();
});

client.login(token);
