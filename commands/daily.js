const { EmbedBuilder } = require("discord.js");
const parseMilliseconds = require("parse-ms-2");
const profileModel = require("../models/profileSchema");
const { dailyReward } = require("../globalValues.json");

module.exports = {
    name: "daily",
    description: "Claim your daily Foli reward!",
    aliases: ["dl"],
    cooldown: 86400000,
    async execute(message, profileData, args) {
        const user = message.author;
        const userId = user.id;
        const { dailyLastUsed, balance } = profileData;

        const cooldown = 86400000; // 24 hours
        const timeLeft = cooldown - (Date.now() - dailyLastUsed);

        if (timeLeft > 0) {
            const { hours, minutes, seconds } = parseMilliseconds(timeLeft);

            const cooldownEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Cooldown Active")
                .setDescription(
                    `You have already claimed your daily reward! You can claim it again in **${hours} hrs, ${minutes} min, and ${seconds} sec**.`
                )
                .setAuthor({
                    name: `${user.tag}`,
                    iconURL: user.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp();

            return await message.channel.send({ embeds: [cooldownEmbed] });
        }

        const reward = dailyReward;

        try {
            await profileModel.findOneAndUpdate(
                { userId: userId },
                {
                    $set: { dailyLastUsed: Date.now() },
                    $inc: { balance: reward },
                }
            );
        } catch (error) {
            console.error(error);
            return message.channel.send("❌ There was an error while claiming your daily reward.");
        }

        const rewardEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("💰 Daily Foli Reward!")
            .setDescription(`<@${userId}>, you have successfully claimed your daily reward!`)
            .addFields(
                { name: "Reward", value: `**+${reward} Foli 🍀**`, inline: true },
                { name: "Current Balance", value: `**${balance + reward} Foli 🍀**`, inline: true }
            )
            .setAuthor({
                name: `${user.tag}`,
                iconURL: user.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        return await message.channel.send({ embeds: [rewardEmbed] });
    },
};
