const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { 
    parseEveTime, 
    getAllDiscordTimestamps, 
    formatTime
} = require('../utils/timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('evetime')
        .setDescription('Convert EVE Time (UTC) to local time for everyone')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('EVE Time in HH:MM format (24-hour)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Date in YYYY-MM-DD format (defaults to today)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('event')
                .setDescription('Name/description of the event')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const timeStr = interaction.options.getString('time');
            const dateStr = interaction.options.getString('date');
            const eventName = interaction.options.getString('event') || 'Fleet/Event';

            console.log(`[DEBUG] evetime command - time: ${timeStr}, date: ${dateStr}, event: ${eventName}`);

            // Parse the EVE time
            const eveTime = parseEveTime(timeStr, dateStr);
            
            if (!eveTime) {
                console.log(`[DEBUG] Failed to parse time: ${timeStr}`);
                return await interaction.reply({
                    content: '❌ Invalid time format! Please use HH:MM (24-hour format), e.g., `19:00` or `07:30`',
                    ephemeral: true
                });
            }

            console.log(`[DEBUG] Parsed EVE time: ${eveTime.toISO()}`);

            // Get all Discord timestamp formats
            const timestamps = getAllDiscordTimestamps(eveTime);

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(0x00D4AA) // EVE Online teal color
                .setTitle(`📅 ${eventName}`)
                .setDescription(`**EVE Time:** ${formatTime(eveTime, true)} UTC`)
                .addFields(
                    {
                        name: '🕐 Your Local Time',
                        value: `${timestamps.longDateTime}\n${timestamps.relative}`,
                        inline: false
                    }
                )
                .setFooter({ text: 'Times shown in your local timezone • EVE Time = UTC' })
                .setTimestamp(eveTime.toJSDate());

            await interaction.reply({ embeds: [embed] });
            console.log(`[DEBUG] evetime command completed successfully`);
        } catch (error) {
            console.error('[ERROR] evetime command failed:', error);
            
            // Try to respond with an error message
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: '❌ An error occurred while processing your request.',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: '❌ An error occurred while processing your request.',
                        ephemeral: true
                    });
                }
            } catch (replyError) {
                console.error('[ERROR] Failed to send error response:', replyError);
            }
        }
    },
};
