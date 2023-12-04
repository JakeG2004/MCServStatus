const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mcsrvstat = require('mcsrvstat-wrapper');
const { getAverageColor } = require('fast-average-color-node');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Gives info about the server'),

	async execute(interaction) {
		//Defer Reply to prevent timeout error
		await interaction.deferReply();
		 
		//interaction.reply("Finding data...");
		const guild = interaction.guildId;

		fs.readFile('serverinfo.json', 'utf8', (err, data) => {
			if (err) {
				console.error('Error reading serverinfo.json', err);
				interaction.editReply("An error occurred while reading server information.");
				return;
			}

			const serverinfo = JSON.parse(data);
			var serverIP = '';

			for (const i in serverinfo.guildID) {
				if (guild == serverinfo.guildID[i]) {
					serverIP = serverinfo.serverIP[i];
				}
			}

			if (serverIP == '') {
				interaction.editReply("Server IP not set up yet. Use /setip to set it.");
				return;
			}

			mcsrvstat.fetchJavaServer(`${serverIP}`).then(async () => {
				if (mcsrvstat.status === false) {
					interaction.editReply(`${serverIP} is offline.`);
					return;
				}

				// Get image
				const img = `https://api.mcsrvstat.us/icon/${serverIP}`;

				// Get average color of server icon
				const color = (await getAverageColor(img)).hex;

				// Define who is online
				var players = mcsrvstat.listPlayers;

				if (!(mcsrvstat.listPlayers)) {
					players = 0;
				}

				// Define embed
				const embed = new EmbedBuilder()
					.setColor(color)
					.setTitle(`Server Info`)
					.setThumbnail(img)
					.addFields(
						{ name: 'Current Players:', value: `${players}` },
						{ name: 'Max Players:', value: `${mcsrvstat.maxPlayers}` },
						{ name: 'Version:', value: `${mcsrvstat.version}` },
						{ name: 'MOTD:', value: `${mcsrvstat.motd}` },
						{ name: 'IP:', value: `${mcsrvstat.hostname}` }
					);

				// Get status
				mcsrvstat.fetchJavaServer(`${serverIP}`).then(() => {
					if (mcsrvstat.status === true) {
						interaction.editReply({ embeds: [embed] });
					} else {
						interaction.editReply(`${serverIP} is offline.`);
					}
				});
			});
		});
	}
};
