const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { 
    parseEveTime, 
    getAllDiscordTimestamps, 
    formatTime,
    getCurrentEveTime 
} = require('../utils/timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('countdown')
        .setDescription('Create a countdown to an EVE Time event')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('EVE Time in HH:MM format (24-hour)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Date in YYYY-MM-DD format (defaults to today/tomorrow)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('event')
                .setDescription('Name of the event')
                .setRequired(false)),

    async execute(interaction) {
        const timeStr = interaction.options.getString('time');
        const dateStr = interaction.options.getString('date');
        const eventName = interaction.options.getString('event') || 'Event';

        // Parse the EVE time
        let eveTime = parseEveTime(timeStr, dateStr);
        
        if (!eveTime) {
            return interaction.reply({
                content: '❌ Invalid time format! Please use HH:MM (24-hour format), e.g., `19:00` or `07:30`',
                ephemeral: true
            });
        }

        // If no date provided and time is in the past, assume tomorrow
        const now = getCurrentEveTime();
        if (!dateStr && eveTime < now) {
            eveTime = eveTime.plus({ days: 1 });
        }

        // Check if event is in the past
        if (eveTime < now) {
            return interaction.reply({
                content: '❌ This event time is in the past! Please provide a future date.',
                ephemeral: true
            });
        }

        const timestamps = getAllDiscordTimestamps(eveTime);

        // Calculate time difference
        const diff = eveTime.diff(now, ['days', 'hours', 'minutes']);
        const days = Math.floor(diff.days);
        const hours = Math.floor(diff.hours);
        const minutes = Math.floor(diff.minutes);

        let countdownStr = '';
        if (days > 0) countdownStr += `${days}d `;
        if (hours > 0 || days > 0) countdownStr += `${hours}h `;
        countdownStr += `${minutes}m`;

        // Create embed
        const embed = new EmbedBuilder()
            .setColor(0xFF6B00) // Orange for countdown
            .setTitle(`⏰ Countdown: ${eventName}`)
            .setDescription(`**Starts ${timestamps.relative}**`)
            .addFields(
                {
                    name: '🎮 EVE Time',
                    value: `**${eveTime.toFormat('HH:mm')}** UTC\n${formatTime(eveTime, true)}`,
                    inline: true
                },
                {
                    name: '🌍 Your Local Time',
                    value: timestamps.longDateTime,
                    inline: true
                },
                {
                    name: '⏱️ Time Remaining',
                    value: `\`${countdownStr}\``,
                    inline: false
                },
                {
                    name: '📋 Share This Time',
                    value: `Copy this to share: \`${timestamps.longDateTime}\``,
                    inline: false
                }
            )
            .setFooter({ text: 'The countdown updates automatically for everyone!' })
            .setTimestamp(eveTime.toJSDate());

        await interaction.reply({ embeds: [embed] });
    },
};
