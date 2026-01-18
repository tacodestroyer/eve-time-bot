# EVE Time Bot 🚀

A Discord bot for EVE Online players to post event times in EVE Time (UTC) that automatically display in each user's local timezone.

## Features

- **`/evetime`** - Post an EVE Time that shows in everyone's local timezone
- **`/now`** - Display the current EVE Time (UTC)
- **`/convert`** - Convert a time from any timezone to EVE Time
- **`/countdown`** - Create a countdown timer to an event
- **`/timezones`** - Show current time in common EVE player timezones
- **`/help`** - Display help information

## How It Works

Discord has built-in support for dynamic timestamps that automatically convert to each user's local timezone. This bot generates these timestamps from EVE Time (UTC), so when you post a fleet time, every corp/alliance member sees it in their own timezone!

### Example Usage

```
/evetime time:19:00 event:Stratop
```

This will display:
- The EVE Time (19:00 UTC)
- A Discord timestamp that shows the local time for each viewer
- A relative time (e.g., "in 2 hours")

## Setup Instructions

### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "EVE Time Bot")
3. Go to the "Bot" section and click "Add Bot"
4. Under "Privileged Gateway Intents", you don't need any special intents
5. Copy the **Bot Token** (keep this secret!)

### 2. Get Your Application IDs

1. In the Developer Portal, go to "General Information"
2. Copy the **Application ID** (this is your Client ID)
3. If testing on a specific server, right-click your server in Discord and copy the **Server ID** (Guild ID)

### 3. Configure the Bot

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here  # Optional, for faster testing
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Deploy Slash Commands

```bash
npm run deploy
```

**Note:** If you set a `GUILD_ID`, commands will be available instantly on that server. Without it, global commands can take up to 1 hour to appear.

### 6. Invite the Bot to Your Server

1. Go to the Developer Portal → OAuth2 → URL Generator
2. Select scopes: `bot`, `applications.commands`
3. Select bot permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`
4. Copy the generated URL and open it in your browser
5. Select your server and authorize

### 7. Start the Bot

```bash
npm start
```

## Commands Reference

### `/evetime`
Post an EVE Time for your corp/alliance.

| Option | Required | Description |
|--------|----------|-------------|
| `time` | Yes | EVE Time in HH:MM format (24-hour) |
| `date` | No | Date in YYYY-MM-DD format (defaults to today) |
| `event` | No | Name/description of the event |

**Examples:**
```
/evetime time:19:00
/evetime time:19:00 event:Fleet Op
/evetime time:07:30 date:2024-03-15 event:Structure Timer
```

### `/now`
Show the current EVE Time (UTC).

### `/convert`
Convert a time from your timezone to EVE Time.

| Option | Required | Description |
|--------|----------|-------------|
| `time` | Yes | Time in HH:MM format (24-hour) |
| `from` | Yes | Source timezone (e.g., EST, PST, Europe/London) |
| `date` | No | Date in YYYY-MM-DD format |

**Examples:**
```
/convert time:14:00 from:EST
/convert time:20:00 from:Europe/London
/convert time:09:00 from:Australia/Sydney date:2024-03-15
```

### `/countdown`
Create a countdown to an EVE Time event.

| Option | Required | Description |
|--------|----------|-------------|
| `time` | Yes | EVE Time in HH:MM format (24-hour) |
| `date` | No | Date in YYYY-MM-DD format |
| `event` | No | Name of the event |

### `/timezones`
Display current time in common EVE player timezones around the world.

### `/help`
Show help information for all commands.

## Supported Timezone Formats

The bot accepts various timezone formats:

### Common Abbreviations
- **Americas:** EST, EDT, CST, CDT, MST, MDT, PST, PDT, AKST, HST
- **Europe:** GMT, BST, WET, CET, CEST, EET, EEST, MSK
- **Asia/Pacific:** IST, SGT, HKT, JST, KST, AWST, AEST, AEDT, NZST, NZDT

### IANA Timezone Names
- `America/New_York`
- `Europe/London`
- `Asia/Tokyo`
- `Australia/Sydney`
- etc.

### EVE Specific
- `EVE`, `EVETIME`, `EVE TIME` → UTC

## Development

### Project Structure
```
eve-time-bot/
├── src/
│   ├── commands/
│   │   ├── convert.js
│   │   ├── countdown.js
│   │   ├── evetime.js
│   │   ├── help.js
│   │   ├── now.js
│   │   └── timezones.js
│   ├── utils/
│   │   └── timezone.js
│   ├── deploy-commands.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Adding New Commands

1. Create a new file in `src/commands/`
2. Export an object with `data` (SlashCommandBuilder) and `execute` (async function)
3. Run `npm run deploy` to register the new command

## Troubleshooting

### Commands not appearing
- Make sure you ran `npm run deploy`
- Global commands can take up to 1 hour to propagate
- Use `GUILD_ID` for instant updates during testing

### Bot not responding
- Check that the bot is online and has proper permissions
- Verify your `DISCORD_TOKEN` is correct
- Check the console for error messages

### Invalid timezone
- Use common abbreviations (EST, PST, CET) or IANA names
- Check the autocomplete suggestions when using `/convert`

## License

MIT License - Feel free to use and modify for your corp/alliance!

---

**Fly safe! o7** 🚀
