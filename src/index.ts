import { GatewayIntentBits } from "discord.js";
import { CustomClient } from "./types/bot_classes";
import dotenv from "dotenv";
import { registerEvents, registerTextCommands } from "./utils/registry";

dotenv.config();

const client = new CustomClient(
	{ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent] },
);

async function main() {
  await registerEvents(client, client, "../events/discord")
  await registerTextCommands(client, "../commands");

  await client.login(process.env.DISCORD_TOKEN);
}

main();