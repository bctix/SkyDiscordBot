/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { ChatCommand, ContextCommand, CustomClient } from "../types/bot_classes";
import { fileURLToPath, pathToFileURL } from "url";
import { APIApplicationCommandOptionChoice, ApplicationCommandOptionType, ContextMenuCommandBuilder, REST, Routes, SlashCommandBuilder } from "discord.js";
import { URL } from "url";

export async function registerTextCommands(client: CustomClient, ...dirs: string[]) {
    dirs.forEach(async (dir) => {
        const files = await fs.promises.readdir(path.join(__dirname, dir));

        for (const idx in files) {
            const file = files[idx];
            const stat = await fs.promises.lstat(path.join(__dirname, dir, file));
            if (stat.isDirectory()) {
                registerTextCommands(client, path.join(dir, file));
            } else {
                if (!file.endsWith(".js")) continue;
                const cmdModule = (await import(path.resolve(__dirname, dir, file))).default;
                if (cmdModule instanceof ChatCommand) {
                    await registerTextCommand(client, cmdModule);
                    continue;
                }
                if (cmdModule instanceof ContextCommand) {
                    await registerContextCommand(client, cmdModule);
                    continue;
                }
            }
        }
    });
}

async function registerContextCommand(client:CustomClient, cmdModule: ContextCommand) {
	if (cmdModule.ignore) {
		return;
	}

	if (!cmdModule.name) {
		console.warn(`The command '${cmdModule.name}' doesn't have a name`);
		return;
	}

	if (!cmdModule.execute) {
		console.warn(`The command '${cmdModule.name}' doesn't have an execute function`);
		return;
	}

	if (client.contextmenucommands.has(cmdModule.name)) {
		console.warn(`The command name '${cmdModule.name}' has already been added.`);
		return;
	}

	client.contextmenucommands.set(cmdModule.name, cmdModule);
}

async function registerTextCommand(client:CustomClient, cmdModule: ChatCommand) {
	if (cmdModule.ignore) {
		return;
	}

	if (!cmdModule.name) {
		console.warn(`The command '${cmdModule.name}' doesn't have a name`);
		return;
	}

	if (!cmdModule.execute) {
		console.warn(`The command '${cmdModule.name}' doesn't have an execute function`);
		return;
	}

	if (client.chatcommands.has(cmdModule.name)) {
		console.warn(`The command name '${cmdModule.name}' has already been added.`);
		return;
	}

	client.chatcommands.set(cmdModule.name, cmdModule);

	if (cmdModule.aliases && cmdModule.aliases.length !== 0) {
		cmdModule.aliases.forEach((alias: string) => {
			if (client.chatcommands.has(alias)) {
				console.warn(`The command alias '${alias}' has already been added.`);
			}
			else {
				const cmdClone = Object.assign({}, cmdModule);
				cmdClone.isAlias = true;
				client.chatcommands.set(alias, cmdClone);
			}
		});
	}
}

export async function registerEvents(EventClient: any, ExecuteClient: CustomClient, ...dirs: string[]) {
    for (const dir of dirs) {
        const files = await fs.promises.readdir(path.resolve(__dirname, dir));

        for (const file of files) {
            const stat = await fs.promises.lstat(path.resolve(__dirname, dir, file));
            if (stat.isDirectory()) {
                await registerEvents(EventClient, ExecuteClient, path.join(dir, file));
            } else {
                if (!file.endsWith(".js")) continue;
                const eventModule = (await import(path.resolve(__dirname, dir, file))).default;
                if (eventModule.once) {
                    EventClient.once(eventModule.name, (...args: any) => eventModule.execute(ExecuteClient, ...args));
                }
                EventClient.on(eventModule.name, (...args: any) => eventModule.execute(ExecuteClient, ...args));
            }
        }
    }
}

export async function removeSlashCommands(client:CustomClient) {
	if (!client.token || !client.user) {
		console.warn("Failed to get client data! Unable to remove slash commands!");
		return;
	}

	const rest = new REST().setToken(client.token);

	try {
		await rest.put(
			Routes.applicationCommands(client.user.id),
			{ body: [] },
		);
	}
	catch (error) {
		console.error(error);
	}
}

export async function deployApplicationCommands(client:CustomClient) {
	if (!client.token || !client.user) {
		console.warn("Failed to get client data! Unable to deploy slash commands!");
		return;
	}

	const rest = new REST().setToken(client.token);

	try {
		const builtCommands: any[] = [];

		client.chatcommands.forEach(command => {
			if (command.noSlash) return;
			if (command.isAlias) return;

			const slashCommand = new SlashCommandBuilder();
			slashCommand.setName(command.name);
			slashCommand.setDescription(command.description);
			if (command.contexts) slashCommand.setContexts(command.contexts);

			if (command.options && command.options.length > 0) {
				command.options.forEach(commandOption => {
					switch (commandOption.type) {
					case (ApplicationCommandOptionType.String): {
						slashCommand.addStringOption((option) => {
							option.setName(commandOption.name);
							option.setDescription(commandOption.description);
							if (commandOption.required) {option.setRequired(commandOption.required);}
							if (commandOption.choices) {option.addChoices(commandOption.choices as APIApplicationCommandOptionChoice<string>[]);}

							return option;
						});
						break;
					}
					case (ApplicationCommandOptionType.Boolean): {
						slashCommand.addNumberOption((option) => {
							option.setName(commandOption.name);
							option.setDescription(commandOption.description);
							if (commandOption.required) {option.setRequired(commandOption.required);}

							return option;
						});
						break;
					}
					case (ApplicationCommandOptionType.Number): {
						slashCommand.addNumberOption((option) => {
							option.setName(commandOption.name);
							option.setDescription(commandOption.description);
							if (commandOption.required) {option.setRequired(commandOption.required);}
							if (commandOption.choices) {option.addChoices(commandOption.choices as APIApplicationCommandOptionChoice<number>[]);}

							return option;
						});
						break;
					}
					case (ApplicationCommandOptionType.Integer): {
						slashCommand.addIntegerOption((option) => {
							option.setName(commandOption.name);
							option.setDescription(commandOption.description);
							if (commandOption.required) {option.setRequired(commandOption.required);}

							return option;
						});
						break;
					}
					case (ApplicationCommandOptionType.Attachment): {
						slashCommand.addAttachmentOption((option) => {
							option.setName(commandOption.name);
							option.setDescription(commandOption.description);
							if (commandOption.required) {option.setRequired(commandOption.required);}

							return option;
						});
						break;
					}
					}
				});
			}

			builtCommands.push(slashCommand.toJSON());
		});

		client.contextmenucommands.forEach(command => {
			if (command.ignore) return;

			const appcommand = new ContextMenuCommandBuilder();

			appcommand.setName(command.name);
			appcommand.setType(command.type);
			if (command.contexts) appcommand.setContexts(command.contexts);

			builtCommands.push(appcommand.toJSON());
		});

		await rest.put(
			Routes.applicationCommands(client.user.id),
			{ body: builtCommands },
		);
	}
	catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
}