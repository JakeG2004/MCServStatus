const { SlashCommandBuilder } = require('discord.js');
const serverinfo = require('../serverinfo.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test'),
	async execute(interaction) {
		const guild = interaction.guildId;
		for(i in serverinfo.guildID){
			if(guild == serverinfo.guildID[i]){
				interaction.reply(serverinfo.serverIP[i]);
			}
		}
	},
};

