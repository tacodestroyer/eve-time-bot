const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show help for EVE Time Bot commands'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x00D4AA)
            .setTitle('📚 EVE Time Bot Help')
            .setDescription('Convert EVE Time (UTC) to local time for your corp/alliance members!')
            .addFields(
                {
                    name: '`/evetime <time> [date] [event]`',
                    value: 'Post an EVE Time that shows in everyone\'s local timezone.\n' +
                           '• `time` - EVE Time in HH:MM format (e.g., 19:00)\n' +
                           '• `date` - Optional date in YYYY-MM-DD format\n' +
                           '• `event` - Optional event name\n' +
                           '**Example:** `/evetime time:19:00 event:Fleet Op`',
                    inline: false
                },
                {
                    name: '`/now`',
                    value: 'Show the current EVE Time (UTC).',
                    inline: false
                },
                {
                    name: '`/convert <time> <from> [date]`',
                    value: 'Convert a time from your timezone to EVE Time.\n' +
                           '• `time` - Time in HH:MM format\n' +
                           '• `from` - Your timezone (e.g., EST, PST, Europe/London)\n' +
                           '**Example:** `/convert time:14:00 from:EST`',
                    inline: false
                },
                {
                    name: '`/countdown <time> [date] [event]`',
                    value: 'Create a countdown timer to an event.\n' +
                           '**Example:** `/countdown time:20:00 event:Stratop`',
                    inline: false
                },
                {
                    name: '`/timezones`',
                    value: 'Show current time in common EVE player timezones.',
                    inline: false
                },
                {
                    name: '💡 Tips',
                    value: '• Discord automatically converts times to each user\'s local timezone\n' +
                           '• EVE Time = UTC (Coordinated Universal Time)\n' +
                           '• Use 24-hour format for times (e.g., 19:00 not 7:00 PM)\n' +
                           '• Copy the timestamp codes to use in your own messages',
                    inline: false
                }
            )
            .setFooter({ text: 'Fly safe! o7' });

        await interaction.reply({ embeds: [embed] });
    },
};
