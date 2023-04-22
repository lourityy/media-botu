const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const louritydb = require("croxydb")
//discord.gg/altyapilar
module.exports = {
    name: "sistemi-ayarla",
    description: "Sipariş sistemini ayarlarsın.",
    type: 1,
    options: [
        {
            name: "yetkili-rol",
            description: "Sipariş bildirimi yapabilecek yetkili rolünü ayarlarsın.",
            type: 8,
            required: true,
        },
    ],

    run: async (client, interaction) => {

        const sunucuSahibi = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Bu komudu kullanabilmek için sunucu sahibi olmalısın.")


        if (interaction.guild.ownerId !== interaction.user.id) return interaction.reply({ embeds: [sunucuSahibi], ephemeral: true })

        const yetkiliRol = interaction.options.getRole('yetkili-rol')

        const ayarlandi = new EmbedBuilder()
            .setColor("Green")
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL())
            .setDescription(`> Yetkili rolü başarıyla ayarlandı **${interaction.user.username}**\n\n📋 Ayarlanan Rol: ${yetkiliRol}\n\n*Lourity Media iyi satışlar diler...*`)

        louritydb.set(`siparisSistemi_${interaction.guild.id}`, yetkiliRol.id)

        return interaction.reply({ embeds: [ayarlandi], ephemeral: true })
    }
};