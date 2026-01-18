const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { DateTime } = require('luxon');
const { 
    resolveTimezone, 
    getAllDiscordTimestamps, 
    formatTime,
    getCommonTimezones 
} = require('../utils/timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('convert')
        .setDescription('Convert a time from one timezone to EVE Time (UTC)')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time in HH:MM format (24-hour)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('from')
                .setDescription('Source timezone (e.g., EST, PST, Europe/London)')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Date in YYYY-MM-DD format (defaults to today)')
                .setRequired(false)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const timezones = getCommonTimezones();
        
        const filtered = timezones.filter(tz => 
            tz.name.toLowerCase().includes(focusedValue) ||
            tz.value.toLowerCase().includes(focusedValue)
        );
        
        await interaction.respond(
            filtered.slice(0, 25).map(tz => ({ name: tz.name, value: tz.value }))
        );
    },

    async execute(interaction) {
        const timeStr = interaction.options.getString('time');
        const fromTz = interaction.options.getString('from');
        const dateStr = interaction.options.getString('date');

        // Resolve the source timezone
        const resolvedTz = resolveTimezone(fromTz);
        if (!resolvedTz) {
            return interaction.reply({
                content: `❌ Unknown timezone: \`${fromTz}\`\n\nTry common abbreviations like EST, PST, CET, or IANA names like America/New_York`,
                ephemeral: true
            });
        }

        // Parse time
        const timeMatch = timeStr.match(/^(\d{1,2}):?(\d{2})?$/);
        if (!timeMatch) {
            return interaction.reply({
                content: '❌ Invalid time format! Please use HH:MM (24-hour format), e.g., `19:00` or `07:30`',
                ephemeral: true
            });
        }

        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2] || '0');

        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return interaction.reply({
                content: '❌ Invalid time! Hours must be 0-23 and minutes must be 0-59.',
                ephemeral: true
            });
        }

        // Get current date or parse provided date
        let year, month, day;
        if (dateStr) {
            const dateParts = dateStr.split(/[-\/]/);
            if (dateParts.length === 3) {
                year = parseInt(dateParts[0]);
                month = parseInt(dateParts[1]);
                day = parseInt(dateParts[2]);
            } else {
                return interaction.reply({
                    content: '❌ Invalid date format! Please use YYYY-MM-DD, e.g., `2024-03-15`',
                    ephemeral: true
                });
            }
        } else {
            const now = DateTime.now().setZone(resolvedTz);
            year = now.year;
            month = now.month;
            day = now.day;
        }

        // Create DateTime in source timezone
        const sourceTime = DateTime.fromObject(
            { year, month, day, hour: hours, minute: minutes },
            { zone: resolvedTz }
        );

        if (!sourceTime.isValid) {
            return interaction.reply({
                content: '❌ Invalid date/time combination!',
                ephemeral: true
            });
        }

        // Convert to EVE Time (UTC)
        const eveTime = sourceTime.toUTC();
        const timestamps = getAllDiscordTimestamps(eveTime);

        // Create embed
        const embed = new EmbedBuilder()
            .setColor(0x00D4AA)
            .setTitle('🔄 Time Conversion')
            .addFields(
                {
                    name: `📍 Original Time (${fromTz})`,
                    value: formatTime(sourceTime, true),
                    inline: false
                },
                {
                    name: '🎮 EVE Time (UTC)',
                    value: `**${eveTime.toFormat('HH:mm')}** - ${formatTime(eveTime, true)}`,
                    inline: false
                },
                {
                    name: '🌍 Your Local Time',
                    value: `${timestamps.longDateTime}\n${timestamps.relative}`,
                    inline: false
                }
            )
            .setFooter({ text: 'EVE Time = UTC' })
            .setTimestamp(eveTime.toJSDate());

        await interaction.reply({ embeds: [embed] });
    },
};
