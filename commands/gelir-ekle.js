const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const config = require("../config.json");
const db = require("croxydb")
//discord.gg/altyapilar
module.exports = {
    name: "gelir-ekle",
    description: "Gelir ekle",
    type: 1,
    options: [
        {
            name: "miktar",
            description: "Gelir miktarını yazın",
            type: 3,
            required: true,
        },
        {
            name: "sebep",
            description: "Gelirin nereden geldiğini yazın",
            type: 3,
            required: true,
        },
    ],

    run: async (client, interaction) => {

        const yetki_embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Bu komudu kullanabilmek için özel role sahip olmalısın.")

        if (!interaction.member.roles.cache.has(config.PERM)) return interaction.reply({ embeds: [yetki_embed], ephemeral: true })

        const miktar = interaction.options.getString('miktar')
        const sebep = interaction.options.getString('sebep')

        const toplam_para = db.get(`para_${interaction.user.id}`)

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`> Kasaya bir gelir eklendi :bell:\n\n💵 Eklenen Gelir Miktarı: \`${miktar}\`\n🗒️ Sebep: \`${sebep}\`\n\n📌 Toplam Para: \`${toplam_para || miktar}\``)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
            .setFooter({ text: `${interaction.user.tag} tarafından bir gelir eklendi!`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

        db.add(`para_${interaction.user.id}`, miktar)
        db.push(`gelirData_${interaction.user.id}`, miktar + " - " + sebep)

        return interaction.reply({ embeds: [embed] })
    }
};
