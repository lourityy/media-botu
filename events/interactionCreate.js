const { Collection, EmbedBuilder } = require("discord.js");
const louritydb = require("croxydb");
const { readdirSync } = require("fs");
//discord.gg/altyapilar
module.exports = async (client, interaction) => {

  if (interaction.isChatInputCommand()) {

    if (!interaction.guildId) return;

    readdirSync('./commands').forEach(f => {

      const cmd = require(`../commands/${f}`);
// lourity <3
      if (interaction.commandName.toLowerCase() === cmd.name.toLowerCase()) {

        return cmd.run(client, interaction, louritydb);
      }
    });
  }
};
