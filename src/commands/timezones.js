const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { DateTime } = require('luxon');
const { getCurrentEveTime } = require('../utils/timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timezones')
        .setDescription('Show current time in common EVE player timezones'),

    async execute(interaction) {
        const now = getCurrentEveTime();

        // Define timezone groups
        const timezones = [
            { name: '🎮 EVE Time', zone: 'UTC', flag: '🌐' },
            { name: 'US East', zone: 'America/New_York', flag: '🇺🇸' },
            { name: 'US Central', zone: 'America/Chicago', flag: '🇺🇸' },
            { name: 'US Mountain', zone: 'America/Denver', flag: '🇺🇸' },
            { name: 'US Pacific', zone: 'America/Los_Angeles', flag: '🇺🇸' },
            { name: 'UK', zone: 'Europe/London', flag: '🇬🇧' },
            { name: 'Central EU', zone: 'Europe/Paris', flag: '🇪🇺' },
            { name: 'Eastern EU', zone: 'Europe/Helsinki', flag: '🇪🇺' },
            { name: 'Moscow', zone: 'Europe/Moscow', flag: '🇷🇺' },
            { name: 'Australia', zone: 'Australia/Sydney', flag: '🇦🇺' },
            { name: 'Japan', zone: 'Asia/Tokyo', flag: '🇯🇵' },
            { name: 'New Zealand', zone: 'Pacific/Auckland', flag: '🇳🇿' },
        ];

        // Build timezone list
        const tzList = timezones.map(tz => {
            const localTime = now.setZone(tz.zone);
            const offset = localTime.toFormat('ZZ');
            const time = localTime.toFormat('HH:mm');
            const date = localTime.toFormat('ccc, LLL d');
            return `${tz.flag} **${tz.name}** (${offset})\n└ ${time} - ${date}`;
        });

        // Split into two columns
        const midpoint = Math.ceil(tzList.length / 2);
        const leftColumn = tzList.slice(0, midpoint).join('\n\n');
        const rightColumn = tzList.slice(midpoint).join('\n\n');

        const embed = new EmbedBuilder()
            .setColor(0x00D4AA)
            .setTitle('🌍 Current Time Around the World')
            .setDescription(`Current EVE Time: **${now.toFormat('HH:mm:ss')} UTC**`)
            .addFields(
                { name: 'Americas & Europe', value: leftColumn, inline: true },
                { name: 'Russia & Pacific', value: rightColumn, inline: true }
            )
            .setFooter({ text: 'EVE Time = UTC • Use /convert to convert specific times' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
