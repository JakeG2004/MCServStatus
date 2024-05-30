const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
var fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('activity')
		.setDescription('Lists last online time of all players')
		.addStringOption(option =>
            option.setName('username')
                .setDescription('Get last online time of a specific user')),

	async execute(interaction) {
		//handle no args
		if(interaction.options.getString('username') == null)
		{
			//read data
			fs.readFile('player_log.json', 'utf8', (err, data) => {

				//error check
				if (err) {
					interaction.reply("Error Reading player log");
					return;
				}

				try{

					//parse data
					let playerLog = JSON.parse(data);

					//get arrays
					let players = playerLog.onlinePlayers;
					let overdues = playerLog.overduePlayers;

					//handle empty overdues
					if(overdues.length === 0)
					{
						overdues = "No Overdue Players";
					}

					//filter remove intersection from players and overdues
					players = players.filter(x => !overdues.includes(x));

					//build embed
					const embed = new EmbedBuilder()
					.setTitle(`User Activity Tracker`)
					.addFields(
						{ name: 'Players:', value: `${players}` },
						{ name: 'Overdue Players:', value: `${overdues}` },
						{ name: 'Last Checked:', value: `${playerLog.checkedAt}`}
					);

					//send reply
					interaction.reply({ embeds: [embed] });
				}

				catch
				{
					interaction.reply("Failed to parse data. Try again");
				}

			});
		}
		
		//handle args
		else 
		{
			//read data
			fs.readFile('playerLastOnline.json', 'utf8', (err, data) => {

				//error check
				if (err) {
					interaction.reply("Error Reading player log");
					return;
				}

				try{

					//parse data
					let playerLog = JSON.parse(data);
					
					//if query is not present
					if(!playerLog.hasOwnProperty(interaction.options.getString('username'))) 
					{
						interaction.reply("User by name " + interaction.options.getString('username') + " not found.");
						return;
					} 

					//build embed if user is present
					const embed = new EmbedBuilder()
					.setTitle(`User Activity Tracker`)
					.addFields(
						{ name: 'Player Name:', value: `${interaction.options.getString('username')}` },
						{ name: 'Last Online:', value: `${playerLog[interaction.options.getString('username')]}` }
					);

					//send reply
					interaction.reply({ embeds: [embed] });
				}

				catch
				{
					interaction.reply("Failed to parse data. Try again");
				}

			});
		}
	}
}