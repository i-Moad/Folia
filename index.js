require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const keep_alive = require("./keep_alive.js");

const { DISCORD_TOKEN: token, MONGODB_SRV: db } = process.env;

// The necessary dicord.js classes
const { Client, GatewayIntentBits, Collection } = require("discord.js");

// Client instace
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

// Loads the events on start
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Loads the commands on start
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("name" in command && "execute" in command) {
        client.commands.set(command.name, command);
    } else {
        console.log(
            `[WARNING] the command at ${filePath} is missing a required "data" or "execute property"`
        );
    }
}

mongoose
    .connect(db)
    .then(() => {
        console.log("Connected to the database!");
    })
    .catch((err) => {
        console.log(err);
    });

client.login(token);
