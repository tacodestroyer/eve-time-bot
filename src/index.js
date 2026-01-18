const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');

// Validate environment variables
if (!process.env.DISCORD_TOKEN) {
    console.error('[ERROR] DISCORD_TOKEN is not set in .env file!');
    console.error('[INFO] Copy .env.example to .env and add your bot token.');
    process.exit(1);
}

// Create Discord client
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Collection to store commands
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');

try {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`[INFO] Loaded command: ${command.data.name}`);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing required "data" or "execute" property.`);
            }
        } catch (error) {
            console.error(`[ERROR] Failed to load command ${file}:`, error);
        }
    }
} catch (error) {
    console.error('[ERROR] Failed to read commands directory:', error);
    process.exit(1);
}

// Handle interactions
client.on('interactionCreate', async interaction => {
    // Handle autocomplete
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command || !command.autocomplete) return;
        
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(`[ERROR] Autocomplete error for ${interaction.commandName}:`, error);
        }
        return;
    }

    // Handle slash commands
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`[ERROR] No command matching ${interaction.commandName} was found.`);
        try {
            await interaction.reply({ 
                content: 'Unknown command. Please try again.', 
                ephemeral: true 
            });
        } catch (e) {
            console.error('[ERROR] Failed to reply to unknown command:', e);
        }
        return;
    }

    console.log(`[INFO] Executing command: ${interaction.commandName} by ${interaction.user.tag}`);

    try {
        await command.execute(interaction);
        console.log(`[INFO] Command ${interaction.commandName} executed successfully`);
    } catch (error) {
        console.error(`[ERROR] Error executing ${interaction.commandName}:`, error);
        
        const errorMessage = { 
            content: 'There was an error while executing this command!', 
            ephemeral: true 
        };
        
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        } catch (replyError) {
            console.error('[ERROR] Failed to send error message:', replyError);
        }
    }
});

// Bot ready event
client.once('ready', () => {
    console.log('========================================');
    console.log(`[SUCCESS] EVE Time Bot is online!`);
    console.log(`[INFO] Logged in as: ${client.user.tag}`);
    console.log(`[INFO] Serving ${client.guilds.cache.size} guild(s)`);
    console.log(`[INFO] Commands loaded: ${client.commands.size}`);
    console.log('========================================');
});

// Error handling
client.on('error', error => {
    console.error('[ERROR] Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('[ERROR] Unhandled promise rejection:', error);
});

// Login to Discord
console.log('[INFO] Connecting to Discord...');
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('[ERROR] Failed to login:', error);
    process.exit(1);
});
