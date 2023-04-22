const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const louritydb = require("croxydb")
//discord.gg/altyapilar
module.exports = {
    name: "ticket-kur",
    description: "Altbayiler için geliştirilmiş ticket sistemini kurarsın.",
    type: 1,
    options: [
        {
            name: "sipariş-sorumlusu",
            description: "Siparişlere bakacak yetkili rolünü ayarlarsın.",
            type: 8,
            required: true,
        },
        {
            name: "destek-sorumlusu",
            description: "Desteklere bakacak yetkili rolünü ayarlarsın.",
            type: 8,
            required: true,
        },
        {
            name: "sipariş-kategorisi",
            description: "Siparişlerin açılacağı kategoriyi ayarlarsın.",
            type: 7,
            required: true,
            channel_types: [4]
        },
        {
            name: "destek-kategorisi",
            description: "Desteklerin açılacağı kategoriyi ayarlarsın.",
            type: 7,
            required: true,
            channel_types: [4]
        },
        {
            name: "sipariş-log",
            description: "Sipariş bilgilerinin atılacağı kanalı ayarlarsın.",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "destek-log",
            description: "Destek bilgilerinin atılacağı kanalı ayarlarsın.",
            type: 7,
            required: true,
            channel_types: [0]
        },
    ],

    run: async (client, interaction) => {

        const sunucuSahibi = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Bu komudu kullanabilmek için sunucu sahibi olmalısın.")

        if (interaction.guild.ownerId !== interaction.user.id) return interaction.reply({ embeds: [sunucuSahibi], ephemeral: true })


        const siparis_yetkilisi = interaction.options.getRole('sipariş-sorumlusu')
        const destek_yetkilisi = interaction.options.getRole('destek-sorumlusu')
        const siparis_kategorisi = interaction.options.getChannel('sipariş-kategorisi')
        const destek_kategorisi = interaction.options.getChannel('destek-kategorisi')
        const siparis_log = interaction.options.getChannel('sipariş-log')
        const destek_log = interaction.options.getChannel('destek-log')


        const saveEmbed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`> Sipariş ve Destek sistemi başarıyla ayarlandı **${interaction.user.username}**`)
            .addFields(
                { name: "Sipariş Yetkilisi", value: `${siparis_yetkilisi}`, inline: true },
                { name: "Destek Yetkilisi", value: `${destek_yetkilisi}`, inline: true },
                { name: "Sipariş Kategorisi", value: `${siparis_kategorisi}`, inline: true },
                { name: "Destek Kategorisi", value: `${destek_kategorisi}`, inline: true },
                { name: "Sipariş Log", value: `${siparis_log}`, inline: true },
                { name: "Destek Log", value: `${destek_log}`, inline: true },
            )
            .setFooter({ text: `Botumuzun rolünü en üste almayı unutmayın!` })
            .setThumbnail("https://media.discordapp.net/attachments/1041358218573647872/1063474184547737640/Lourity_Media_Logo.png?width=450&height=450")

        interaction.reply({ embeds: [saveEmbed], ephemeral: true })

        louritydb.set(`ticketSistemi_${interaction.guild.id}`, { siparis_yetkilisi: siparis_yetkilisi.id, destek_yetkilisi: destek_yetkilisi.id, siparis_kategorisi: siparis_kategorisi.id, destek_kategorisi: destek_kategorisi.id, siparis_log: siparis_log.id, destek_log: destek_log.id })

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Sipariş Ver")
                    .setEmoji("💳")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("siparis")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Destek Talebi Oluştur")
                    .setEmoji("🎫")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("destek")
            )


        const sistemEmbed = new EmbedBuilder()
            .setColor("5865f2")
            .setTitle(`Sipariş & Destek | ${interaction.guild.name}`)
            .setDescription(`🛒・Buradan __sipariş verebilir veya destek alabilirsin__!\n💳・Papara ile alınan ürünlerde __indirim mevcuttur__.\n🏷️・Toplu alımlarda indirim yapılır.`)
            .setFooter({ text: "Lütfen gereksiz talep açmayın.", iconURL: "https://media.discordapp.net/attachments/1041358218573647872/1063474184547737640/Lourity_Media_Logo.png?width=450&height=450" })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }) || "https://media.discordapp.net/attachments/1041358218573647872/1063474184547737640/Lourity_Media_Logo.png?width=450&height=450")

        interaction.channel.send({ embeds: [sistemEmbed], components: [row] })
    }
};