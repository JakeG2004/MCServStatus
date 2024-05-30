const { SlashCommandBuilder } = require('discord.js');
var fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setip')
		.setDescription('Changes Server IP')
        .addStringOption(option =>
            option.setName('serverip')
                .setDescription('The IP the bot will use')),

	async execute(interaction) {
		const guild = interaction.guildId;

		// Read the JSON file
		fs.readFile('serverinfo.json', 'utf8', (err, data) => {
			if (err) {
				interaction.reply("Error");
				return;
			}

			try {
				// Parse the JSON data
				const jsonData = JSON.parse(data);

				// Check if the guildID already exists
				const index = jsonData.guildID.indexOf(guild);
				if (index !== -1) {
					// If it exists, replace the corresponding serverIP
					jsonData.serverIP[index] = interaction.options.getString('serverip');
				} else {
					// If it doesn't exist, add a new pair
					jsonData.guildID.push(guild);
					jsonData.serverIP.push(interaction.options.getString('serverip'));
				}

				// Convert the updated JSON back to a string
				const updatedData = JSON.stringify(jsonData, null, 2);

				// Write the updated JSON back to the file
				fs.writeFile('serverinfo.json', updatedData, 'utf8', (err) => {
					if (err) {
						interaction.reply("Error");
					}
				});
			} catch (parseError) {
				interaction.reply("Error");
			}
		});
		await interaction.reply(`Set server IP to ${interaction.options.getString('serverip')}`);
	},
};