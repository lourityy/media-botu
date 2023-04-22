const { Client, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const louritydb = require("croxydb")
const config = require("../config.json");
//discord.gg/altyapilar
module.exports = {
    name: "sipariş-bildirim",
    description: "Sipariş geldiğinde ana bayiye bildirim atarsınız.",
    type: 3,
    options: [
        {
            name: "ürün",
            description: "Siparişteki ürün adını giriniz.",
            type: 3,
            required: true,
        },
        {
            name: "ödeme-durumu",
            description: "Ürünün maliyetinin ödenip ödenmediğini seçin.",
            type: 3,
            required: true,
            choices: [
                {
                    name: "🟢 Müşteri maliyeti ödedi!",
                    value: 'odedi'
                },
                {
                    name: "🔴 Müşteri maliyeti ödemedi!",
                    value: 'odenmedi'
                }
            ]
        },
        {
            name: "dekont",
            description: "Müşterinin size ilettiği dekontun fotoğrafını yükleyin.",
            type: 11,
            required: true,
        },
        {
            name: "hesap-link",
            description: "Müşterinin aldığı ürünün iletileceği hesap linki.",
            type: 3,
            required: true,
        },
        {
            name: "müşteri",
            description: "Müşteriyi seçin.",
            type: 6,
            required: true,
        },
        {
            name: "ek-açıklama",
            description: "Siparişle ilgili ek açıklama girebilirsin, bu işi daha da kolaylaştırır.",
            type: 3,
            required: false,
        },
    ],

    run: async (client, interaction) => {

        let siparisYetkili = louritydb.get(`siparisSistemi_${interaction.guild.id}`)

        const ayarliDegil = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Sipariş sistemi ayarlı değil!")

        if (!siparisYetkili) return interaction.reply({ embeds: [ayarliDegil], ephemeral: true })

        const yetkinYok = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`Sistemi kullanmak için <@&${siparisYetkili}> yetkisine sahip olmalısın.`)

        if (!interaction.member.roles.cache.has(siparisYetkili)) return interaction.reply({ embeds: [yetkinYok], ephemeral: true })

        let logChannel = client.channels.cache.get(config.LOG)

        const kanalYok = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Sipariş kanalı bulunamadı acilen bayiye bildirin!")

        if (!logChannel) return interaction.reply({ embeds: [kanalYok], ephemeral: true })

        const musteri = interaction.options.getMember('müşteri')

        let lourityİnput = interaction.options.getString('ödeme-durumu')
        const urun = interaction.options.getString('ürün')
        const hesapLink = interaction.options.getString('hesap-link')
        const ekAciklama = interaction.options.getString('ek-açıklama')
        const dekont = interaction.options.getAttachment('dekont')

        if (lourityİnput === 'odenmedi') {

            const odenmediEmbed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Sipariş maliyeti ödenmediği için işlem durduruldu!`)

            return interaction.reply({ embeds: [odenmediEmbed] })

        }

        const inviteURL = await interaction.channel.createInvite({ maxAge: 172800 })

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Tamamlandı")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("tamamlandi")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İşlemde")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("islemde")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İptal")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("iptal")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Sunucuya Git")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${inviteURL}`)
            )

        let siparisNo = louritydb.get(`siparisNo_`)

        const basarili = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`> Sipariş başarıyla bayiye gönderildi 🔔\n\n🏷️ Sipariş Numaranız: **${siparisNo}**\n📬 [[Geri bildirim atmak için tıkla]](https://discord.gg/altyapilar)`)

        interaction.reply({ embeds: [basarili] }).catch(e => { console.log(e) })

        const siparisEmbed = new EmbedBuilder()
            .setColor("Green")
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setAuthor({ name: `${interaction.guild.name}'den yeni bir sipariş!` })
            .setDescription(`> Yen bir sipariş geldi! 🔔\n\n🏷️ Sipariş Numarası: **${siparisNo}**\n🛒 Sipariş: \`${urun}\`\n🔗 Hesap Linki: \`${hesapLink}\`\n\n👤 Yetkili: <@${interaction.user.id}> (**${interaction.user.username}**)\n👨 Müşteri: ${musteri} (**${musteri.user.username + "#" + musteri.user.discriminator}**)\n🟢 Müşteri maliyeti __ödedi__!\n\n🗒️ Ek Açıklama: **${ekAciklama || "Ek açıklama girilmedi"}**`)
            .setImage(dekont.url)

        louritydb.add(`siparisNo_`, 1)

        louritydb.set(`siparis_${siparisNo}`, { channel: interaction.channel.id })
        return logChannel.send({ content: `${siparisNo}`, embeds: [siparisEmbed], components: [row] }).catch(e => { console.log(e) })
    }
};