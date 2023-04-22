const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const config = require("../config.json");
const db = require("croxydb")
//discord.gg/altyapilar
module.exports = {
    name: "kasa",
    description: "Toplam paraya ve gider/gelir bilgilerine bakarsın",
    type: 1,
    options: [
        {
            name: "işlem",
            description: "Gelir/Gider sebeplerine bakabilirsin",
            type: 3,
            required: false,
            choices: [
                {
                    name: 'Gelir',
                    value: "gelir"
                },
                {
                    name: 'Gider',
                    value: "gider"
                },
                {
                    name: 'Kasayı Sıfırla',
                    value: "sifirla"
                },
            ]
        }
    ],

    run: async (client, interaction) => {

        const yetki_embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Bu komudu kullanabilmek için özel role sahip olmalısın.")

        if (!interaction.member.roles.cache.has(config.PERM)) return interaction.reply({ embeds: [yetki_embed], ephemeral: true })

        const toplam_para = db.get(`para_${interaction.user.id}`)

        let input = interaction.options.getString('işlem')

        if (!input) {
            const not_input_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setDescription(`:dollar: Toplam Para: \`${toplam_para || "0"}\``)

            return interaction.reply({ embeds: [not_input_embed] })
        }


        if (input === 'gelir') {
            const main_data = db.get(`gelirData_${interaction.user.id}`)

            const hata_embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Hiç gelir verisi yok dostum.")

            if (!main_data) return interaction.reply({ embeds: [hata_embed], ephemeral: true })

            const datas = main_data.map(map => `▶️ \`${map}\` `).join("\n")

            const input_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setDescription(`> Tüm gelir bilgileri :bell:\n\n${datas}\n\n:dollar: Toplam Para: \`${toplam_para}\``)
                .setFooter({ text: `${interaction.user.tag} tarafından sorgulandı!`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

            return interaction.reply({ embeds: [input_embed] })
        }


        if (input === 'gider') {
            const main_data = db.get(`giderData_${interaction.user.id}`)

            const hata_embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Hiç gider verisi yok dostum.")

            if (!main_data) return interaction.reply({ embeds: [hata_embed], ephemeral: true })

            const datas = main_data.map(map => `▶️ \`${map}\` `).join("\n")

            const input_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setDescription(`> Tüm gider bilgileri; :bell:\n\n${datas}\n\n:dollar: Toplam Para: \`${toplam_para}\``)
                .setFooter({ text: `${interaction.user.tag} tarafından sorgulandı!`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

            return interaction.reply({ embeds: [input_embed] })
        }


        if (input === 'sifirla') {

            const input_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setDescription(`Tüm gider/gelir bilgileri ve para sıfırlandı!`)

            db.delete(`para_${interaction.user.id}`)
            db.delete(`giderData_${interaction.user.id}`)
            db.delete(`gelirData_${interaction.user.id}`)

            return interaction.reply({ embeds: [input_embed] })
        }
    }
};
