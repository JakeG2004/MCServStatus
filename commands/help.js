const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Lists MCServStatus commands'),

	async execute(interaction) {
		//Get image
//		const img = `https://api.mcsrvstat.us/icon/${serverIP}`

		//Get average color of server icon
//		const color = (await getAverageColor(img)).hex;

		//Define embed
		const embed = new EmbedBuilder()
//			.setColor(color)
			.setTitle(`Commands`)
//			.setThumbnail(img)
			.addFields(
				{ name: '/help:', value : 'Brings up this menu'},
				{ name: '/info:', value : 'Brings up useful info regarding the server'},
				{ name: '/setip', value: 'Sets the IP to be queried by /info'},
				{ name: '/ping: ', value: 'Responds with pong'},
				{ name: '/activity: ', value: 'Lists player activity'}
			)

		interaction.reply({embeds: [embed]});
	}
};
