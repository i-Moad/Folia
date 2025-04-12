const { EmbedBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    name: "balance",
    description: "Shows user's balance",
    aliases: ["bal"],
    usage: "[@user]",
    async execute(message, profileData, args) {
        let targetUser = message.author;
        let targetProfileData = profileData; // Default to the message author's profileData

        // If a user was mentioned, use that user instead of the message author
        if (args.length && message.mentions.users.size > 0) {
            targetUser = message.mentions.users.first();
            // Fetch the mentioned user's profile data from the database
            try {
                targetProfileData = await profileModel.findOne({ userId: targetUser.id });

                if (!targetProfileData) {
                    // If the mentioned user doesn't have a profile, send an error message
                    const errorEmbed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("❌ Error")
                        .setDescription(`<@${targetUser.id}> doesn't have a profile yet.`) // Mention the user
                        .setAuthor({
                            name: `${targetUser.tag}`,
                            iconURL: targetUser.displayAvatarURL({ dynamic: true }),
                        })
                        .setTimestamp();

                    return message.channel.send({ embeds: [errorEmbed] });
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);

                // Send an error if something went wrong while querying the database
                const errorEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Error")
                    .setDescription("There was an error while fetching the profile data.")
                    .setTimestamp();

                return message.channel.send({ embeds: [errorEmbed] });
            }
        }

        // Get the balance from the correct profile data
        const { balance } = targetProfileData;

        const formattedText = `<@${targetUser.id}>\nYou currently have **${balance} Foli 🍀** in your balance.`;

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("💰 User's Balance")
            .setDescription(formattedText)
            .setAuthor({
                name: `${targetUser.tag}`,
                iconURL: targetUser.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },
};
