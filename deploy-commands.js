const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];

//Load command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

//Register command files
for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        //If command is valid, send to list of commands
        if('data' in command && 'execute' in command){
                commands.push(command.data.toJSON());
        } else {
                console.log('[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.');
        }

}


// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands with the current set
		// NOTE: Registering new commands may take upwards of an hour
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
