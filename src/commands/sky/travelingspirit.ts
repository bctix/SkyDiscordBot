import { EmbedBuilder, hyperlink } from '@discordjs/builders';
import { ChatCommand, ChatCommandOptions, ChatCommandExecute } from '../../types/bot_classes';
import axios from "axios";
import * as cheerio from "cheerio";

/*
This is my first time attempting to scrap data so it might not be very good.
*/

const LINK: string = "https://sky-children-of-the-light.fandom.com"

const textcommand: ChatCommand = new ChatCommand(
    {
        name: "travelingspirit",
        description: "okay",
        aliases: ["ts"],
        usage: "Gets traveling spirit info from the Sky Wiki!",
        async execute(command: ChatCommandExecute) {
            const response = await axios.get(`${LINK}/wiki/Traveling_Spirits`);
            const selector = cheerio.load(response.data);

            const tsInfoBox = selector("aside.portable-infobox.type-TravelingSpirit");
            const title = tsInfoBox.find("h2.pi-title[data-source='title']")

            if (title.text() === "Next Traveling Spirit")
            {
                await command.data.reply("Unknown.");
                return;
            }

            const date = tsInfoBox.find("div.pi-data[data-source='date']")

            const tsLinkA = tsInfoBox.find("nav").find("a");
            const spiritResponse = await axios.get(`${LINK}${tsLinkA.attr("href")}`)
            const tsSelector = cheerio.load(spiritResponse.data);

            const imgFigure = tsSelector("figure.thumb.mw-halign-right.show-info-icon[typeof='mw:File/Thumb']")
            const imgLink = imgFigure.find("a.mw-file-description.image").attr("href");
            
            const embed = new EmbedBuilder();
            embed.setTitle(title.text().trim());
            embed.setDescription("Data scraped from "+hyperlink("Sky Wiki",`${LINK}/wiki/Traveling_Spirits`));
            embed.setColor([229, 222, 207]);
            if(imgLink) embed.setImage(imgLink.trim());
            embed.addFields(
                {name: "Date", value: date.text().trim()},
                {name: "Disclaimer", value: "Prices in image may change!"}
            );

            embed.setFooter({text: "This command is very experimental."});

            await command.data.reply({embeds: [embed]});
        },
    } as ChatCommandOptions
);

export default textcommand;