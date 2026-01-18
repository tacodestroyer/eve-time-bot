const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { 
    getCurrentEveTime, 
    getAllDiscordTimestamps, 
    formatTime 
} = require('../utils/timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('now')
        .setDescription('Show the current EVE Time (UTC)'),

    async execute(interaction) {
        const eveTime = getCurrentEveTime();
        const timestamps = getAllDiscordTimestamps(eveTime);

        const embed = new EmbedBuilder()
            .setColor(0x00D4AA)
            .setTitle('🕐 Current EVE Time')
            .setDescription(`**${eveTime.toFormat('HH:mm:ss')} UTC**`)
            .addFields(
                {
                    name: '📅 Full Date/Time',
                    value: formatTime(eveTime, true),
                    inline: false
                },
                {
                    name: '🌍 Your Local Time',
                    value: timestamps.longDateTime,
                    inline: false
                }
            )
            .setFooter({ text: 'EVE Time = UTC • All in-game times use this timezone' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
