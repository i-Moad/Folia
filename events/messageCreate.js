const profileModel = require("../models/profileSchema");
const prefix = "fl!";

module.exports = {
    name: "messageCreate",
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return; // ignore DMs

        const content = message.content;
        if (!content.toLowerCase().startsWith(prefix)) return;

        // Get user db info
        let profileData;
        try {
            profileData = await profileModel.findOne({
                userId: message.author.id,
            });

            if (!profileData) {
                profileData = await profileModel.create({
                    userId: message.author.id,
                    serverId: message.guild.id,
                });
            }
        } catch (err) {
            console.error("Error fetching or creating profile data:", err);
        }

        const args = content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Check for the command in the client's commands collection (and aliases)
        let command = message.client.commands.get(commandName);
        if (!command) {
            // If the command isn't found, check aliases
            command = message.client.commands.find(
                (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
            );
        }

        if (!command) return;

        try {
            await command.execute(message, profileData, args);
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            message.reply("There was an error trying to execute that command.");
        }
    },
};
