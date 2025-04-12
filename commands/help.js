const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "help",
    description: "List all commands or get info about a specific command.",
    aliases: ["h"],
    usage: "[command name]",

    async execute(message, profileData, args, prefix = "fl!") {
        const { commands } = message.client;

        // If no specific command was requested, show all commands grouped by sections
        if (!args.length) {
            const helpEmbed = new EmbedBuilder()
                .setColor("Blue")
                .setTitle("Help Menu | mainotbeserious")
                .setDescription("Here are the available commands:")

                // 1) User Commands
                .addFields(
                    {
                        name: "1 | 👤 User Commands",
                        value: "`balance`, `daily`",
                        inline: false,
                    },
                    // 2) Bot Information
                    {
                        name: "2 | ℹ️ Bot Information",
                        value: "`help`",
                        inline: false,
                    }
                )
                .setFooter({ text: `Total: ${commands.size} commands` })
                .setTimestamp();

            return message.channel.send({ embeds: [helpEmbed] });
        }

        // Show help for a specific command
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(cmd => cmd.aliases?.includes(name));

        if (!command) {
            const noCommandEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Command Not Found")
                .setDescription(`I couldn't find a command named \`${name}\`.`)
                .setTimestamp();

            return message.channel.send({ embeds: [noCommandEmbed] });
        }

        // Check for cooldown
        let cooldownText = "No cooldown"; // Default text if no cooldown is set
        if (command.cooldown) {
            const cooldown = command.cooldown;
            const seconds = cooldown / 1000; // Convert cooldown to seconds

            // Convert seconds to hours, minutes, and seconds
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = Math.floor(seconds % 60);

            // Build the cooldown text
            cooldownText = `${hours} hrs, ${minutes} min, ${remainingSeconds} sec`;
        }

        const commandEmbed = new EmbedBuilder()
            .setTitle(`📘 Help: ${command.name}`)
            .setColor("Blue")
            .addFields(
                { name: "Description", value: command.description || "No description available." },
                { name: "Usage", value: `\`${prefix}${command.name} ${command.usage || ""}\`` },
                { name: "Aliases", value: command.aliases?.length ? command.aliases.map(a => `\`${a}\``).join(", ") : "None" },
                { name: "Cooldown", value: cooldownText }
            )
            .setTimestamp();

        return message.channel.send({ embeds: [commandEmbed] });
    }
};
