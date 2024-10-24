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

// Global variable to store player last online times
let playerLastOnline = {};
try {
	playerLastOnline = JSON.parse(fs.readFileSync('playerLastOnline.json', 'utf8'));
} catch {
	console.log("Parse error");
}


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

//Run scheduler
let updater = new cron.CronJob('* * * * *', () => {
        setinfo();
});

async function setinfo() {
    // Get data from server
    await mcsrvstat.fetchJavaServer(serverIP);

    // If server is up
    if (mcsrvstat.status === true) {
        // Bot description
        if (mcsrvstat.oPlayers !== 1) {
            client.user.setActivity(` with my ${mcsrvstat.oPlayers} friends on ${serverIP}!`);
        } else {
            client.user.setActivity(` with my ${mcsrvstat.oPlayers} friend on ${serverIP}!`);
        }

		logPlayerActivity();
	}

	// Server is down
	else {
		client.user.setActivity("Touching grass");
	}
}

function logPlayerActivity()
{
	let playerLogger = {};

	// Read existing data from the player log file if it exists
	try {
		const data = fs.readFileSync('player_log.json', 'utf8');
		playerLogger = JSON.parse(data);

		//set correct date + remove duplicate players
		playerLogger.checkedAt = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

	} catch (err) {
		// If the file doesn't exist or there is an error reading it, continue with an empty object
		console.log("Error reading player log file");

		//make empty object
		playerLogger = {
			checkedAt: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
			onlinePlayers: [],
			overduePlayers: []
		};
	}

	// Add online players to the playerLogger object
	if(mcsrvstat.oPlayers > 0)
	{
		for(let i = 0; i < mcsrvstat.oPlayers; i++)
		{
			// Update player's last online time
			let player = mcsrvstat.listPlayers[i];

			//prevent duplicates
			if(!playerLogger.onlinePlayers.includes(player))
			{
				playerLogger.onlinePlayers.push(player);
			}

			playerLastOnline[player] = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
		}
	}

	// Check if it has been a week since a player was last online
	checkInactivePlayers(playerLogger);

	//console.log(`Player logger: ${playerLogger.onlinePlayers}`);

	// Write data to JSON files
	fs.writeFileSync('player_log.json', JSON.stringify(playerLogger));
	fs.writeFileSync('playerLastOnline.json', JSON.stringify(playerLastOnline));
}

function checkInactivePlayers(playerLogger) {
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    const currentTime = new Date();

    for (const player in playerLastOnline) {
        const lastOnlineTime = new Date(playerLastOnline[player]);
	var elapsedTime = currentTime - lastOnlineTime;

	//console.log(`One week in ms: ${oneWeekInMs}`);
	//console.log(`${player} elapsed time: ${elapsedTime}`);

        if (elapsedTime >= oneWeekInMs) {
	    //console.log(`${player} has NOT been online recently`);
            if(!playerLogger.overduePlayers.includes(player))
	    {
	        playerLogger.overduePlayers.push(player);
	    }

	    const curPlayerIndex = playerLogger.onlinePlayers.indexOf(player);
	    if(curPlayerIndex != -1)
	    {
	        console.log(`Removing ${player} from online`);
		playerLogger.onlinePlayers.splice(curPlayerIndex, 1);
       	    }
	 }

	else
	{
	    //console.log(`${player} has been on recently`);
	    if(!playerLogger.onlinePlayers.includes(player))
	    {
		playerLogger.onlinePlayers.push(player);
	    }

	    const curPlayerIndex = playerLogger.overduePlayers.indexOf(player);
	    if(curPlayerIndex != -1)
	    {
		console.log(`Removing ${player} from overdue`);
		playerLogger.overduePlayers.splice(curPlayerIndex, 1);
	    }
	}
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
	//client.user.setAvatar(`https://api.mcsrvstat.us/icon/${serverIP}`);
}
 
  //set info and start scheduled messages
  setinfo();
  updater.start();
});

client.login(token);
