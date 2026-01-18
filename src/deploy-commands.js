const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { REST, Routes } = require('discord.js');
const fs = require('fs');

// Validate environment variables
if (!process.env.DISCORD_TOKEN) {
    console.error('[ERROR] DISCORD_TOKEN is not set in .env file!');
    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error('[ERROR] CLIENT_ID is not set in .env file!');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Load all command data
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`[INFO] Loaded command for deployment: ${command.data.name}`);
        }
    } catch (error) {
        console.error(`[ERROR] Failed to load command ${file}:`, error);
    }
}

// Create REST instance
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`[INFO] Started refreshing ${commands.length} application (/) commands.`);

        let data;
        
        if (process.env.GUILD_ID) {
            // Guild-specific commands (instant update, good for testing)
            console.log(`[INFO] Deploying to guild: ${process.env.GUILD_ID}`);
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`[SUCCESS] Successfully reloaded ${data.length} guild commands.`);
        } else {
            // Global commands (takes up to 1 hour to propagate)
            console.log('[INFO] Deploying global commands...');
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`[SUCCESS] Successfully reloaded ${data.length} global commands.`);
            console.log('[INFO] Global commands may take up to 1 hour to appear in all servers.');
        }
    } catch (error) {
        console.error('[ERROR] Failed to deploy commands:', error);
        process.exit(1);
    }
})();
