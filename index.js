// Discord
const { PermissionsBitField, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder, AuditLogEvent } = require("discord.js");
const Discord = require("discord.js");
const fs = require("fs")
// İNTENTS
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember] });
const PARTIALS = Object.values(Partials);
// Database
const louritydb = require("croxydb")


global.client = client;
client.commands = (global.commands = []);
const { readdirSync } = require("fs")
const { TOKEN } = require("./config.json");
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: false,
        type: 1
    });

    console.log(`[COMMAND] ${props.name} komutu yüklendi.`)

});
readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(`[EVENT] ${name} eventi yüklendi.`)
});


client.login(TOKEN)

// Bir Hata Oluştu
process.on("unhandledRejection", (reason, p) => {
    console.log(reason, p);
})

process.on("unhandledRejection", async (error) => {
    return console.log("Bir hata oluştu! " + error)
})
//
//

const iptalModal = new ModalBuilder()
    .setCustomId('iptalForm')
    .setTitle('İptal Sebebi Girin')
const u1 = new TextInputBuilder()
    .setCustomId('iptalSebep')
    .setLabel('İptal Sebebi')
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(5)
    .setMaxLength(50)
    .setPlaceholder('İptal sebebini giriniz')
    .setRequired(true)

const row1 = new ActionRowBuilder().addComponents(u1);
iptalModal.addComponents(row1);

//discord.gg/altyapilar
client.on('interactionCreate', async (interaction) => {

    if (interaction.customId === 'iptalForm') {

        const siparisBilgileri = louritydb.get(`siparis_${interaction.message.content}`)
        let siparisChannel = siparisBilgileri.channel
        var channel = client.channels.cache.get(siparisChannel)
        const sebep = interaction.fields.getTextInputValue("iptalSebep")

        const kanalYokEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Sipariş kanalı silindi veya bulunamadı.")

        if (!channel) return interaction.reply({ embeds: [kanalYokEmbed], ephemeral: true })

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Tamamlandı")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true)
                    .setCustomId("tamamlandi")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İşlemde")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
                    .setCustomId("islemde")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İptal")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setCustomId("iptal")
            )
//discord.gg/altyapilar
        const iptalEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`> Siparişiniz maalesef reddedildi 🔔\n\n💂 Reddeden Yetkili: <@${interaction.user.id}> (**${interaction.user.username}**)\n📋 İptal Sebebi: **${sebep}**\n📬 [[Geri bildirim atmak için tıkla]](https://discord.gg/altyapilar)`)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        louritydb.delete(`siparis_${interaction.message.content}`)
        await interaction.update({ content: `\`${interaction.message.content}\` numaralı sipariş <@${interaction.user.id}> tarafından \`${sebep}\` sebebiyle iptal edildi!`, components: [row] }).catch(e => { console.log(e) })
        return channel.send({ embeds: [iptalEmbed] }).catch(e => { console.log(e) })
    }


    if (interaction.customId === 'davetForm') {
        const url = interaction.fields.getTextInputValue("davetLink")
        await interaction.deferUpdate()
        return interaction.channel.send({ content: `<@${interaction.user.id}> davet linkini iletti! \`${url}\`` })
    }


    if (!interaction.isButton()) return;

    if (interaction.customId === "iptal") {
        await interaction.showModal(iptalModal);
    }

    if (interaction.customId === "islemde") {

        const siparisBilgileri = louritydb.get(`siparis_${interaction.message.content}`)
        let siparisChannel = siparisBilgileri.channel
        var channel = client.channels.cache.get(siparisChannel)

        const kanalYokEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Sipariş kanalı silindi veya bulunamadı.")

        if (!channel) return interaction.reply({ embeds: [kanalYokEmbed], ephemeral: true })

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
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setCustomId("islemde")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İptal")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("iptal")
            )

        const islemdeEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setDescription(`> Siparişiniz işlemdedir 🔔\n\n💂 İşleme Alan Yetkili: <@${interaction.user.id}> (**${interaction.user.username}**)\n📬 [[Geri bildirim atmak için tıkla]](https://discord.gg/altyapilar)`)
            .setFooter({ text: "Siparişiniz en kısa sürede tamamlanacaktır.", iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        await interaction.update({ components: [row] }).catch(e => { console.log(e) })
        return channel.send({ embeds: [islemdeEmbed] }).catch(e => { console.log(e) })
    }

//discord.gg/altyapilar
    if (interaction.customId === "tamamlandi") {

        const siparisBilgileri = louritydb.get(`siparis_${interaction.message.content}`)
        let siparisChannel = siparisBilgileri.channel
        var channel = client.channels.cache.get(siparisChannel)

        const kanalYokEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Sipariş kanalı silindi veya bulunamadı.")

        if (!channel) return interaction.reply({ embeds: [kanalYokEmbed], ephemeral: true })

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Tamamlandı")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setCustomId("tamamlandi")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İşlemde")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
                    .setCustomId("islemde")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İptal")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)
                    .setCustomId("iptal")
            )
//discord.gg/altyapilar
        const tamamlandi = new EmbedBuilder()
            .setColor("5466e2")
            .setDescription(`> Siparişiniz tamamlanmıştır 🔔\n\n💂 Tamamlayan Yetkili: <@${interaction.user.id}> (**${interaction.user.username}**)\n📬 [[Geri bildirim atmak için tıkla]](https://discord.gg/altyapilar)`)
            .setFooter({ text: "Bir sorun varsa geri bildirim için sunucumuza gelin.", iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        louritydb.delete(`siparis_${interaction.message.content}`)
        await interaction.update({ content: `\`${interaction.message.content}\` numaralı sipariş <@${interaction.user.id}> tarafından tamamlandı!`, components: [row] }).catch(e => { console.log(e) })
        return channel.send({ embeds: [tamamlandi] }).catch(e => { console.log(e) })
    }


    if (interaction.customId === "siparis") {

        const sistem = louritydb.get(`ticketSistemi_${interaction.guild.id}`)
        if (!sistem) return interaction.reply({ content: "Sunucuda sipariş sistemi kapalı dostum.", ephemeral: true })

        let me = interaction.guild.members.cache.get(client.user.id)
        if (!me.permissions.has(PermissionsBitField.Flags.Administrator)) {

            const botYetki = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Bunu yapabilmek için yeterli yetkiye sahip değilim.")

            return interaction.reply({ embeds: [botYetki], ephemeral: true })
        }

        let siparis_yetkilisi = sistem.siparis_yetkilisi
        let siparis_kategorisi = sistem.siparis_kategorisi


        let siparisKategori = interaction.guild.channels.cache.get(siparis_kategorisi)

        const siparisKategoriYok = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Sipariş sistemi düzgün ayarlanmamış, kategoriyi bulamadım.")

        if (!siparisKategori) return interaction.reply({ embeds: [siparisKategoriYok], ephemeral: true })


        // const talepKontrol = louritydb.get(`siparisTlb_${interaction.user.id}`)

        // if (talepKontrol) {
        //     const zatenacik = new EmbedBuilder()
        //         .setColor("Red")
        //         .setDescription(`Dostum sana ait zaten bir talep var <#${talepKontrol}>`)

        //     return interaction.reply({ embeds: [zatenacik], ephemeral: true })
        // }

        louritydb.add(`siparisTalepNo_`, 1)

        interaction.guild.channels.create({
            name: `sipariş-${interaction.user.username}`,
            type: Discord.ChannelType.GuildText,
            parent: siparis_kategorisi,

            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [Discord.PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: siparis_yetkilisi,
                    allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                }
            ]
        }).then((siparis_channel) => {

            const siparisEmbed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`Heyy, senin için bir sipariş talebi oluşturdum <#${siparis_channel.id}>`)

            interaction.reply({ embeds: [siparisEmbed], ephemeral: true });

            const talep_no = louritydb.get(`siparisTalepNo_`)
//discord.gg/altyapilar
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Talebi Kapat")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId("kapat")
                )
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("İşlemi Başlat")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId("islem")
                )


            const gonderiEmbed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: `Yeni bir sipariş`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setDescription(`**${interaction.user.username}**, talep kapatılana kadar mesajlar __kayıt edilmektedir__!`)
                .addFields(
                    { name: "Talep Açan:", value: `${interaction.user}`, inline: true },
                    { name: "Talep Açılış Tarihi:", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                )
                .setFooter({ text: `Talep Açan: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setThumbnail(interaction.user.avatarURL({ dynamic: true }) || interaction.guild.iconURL({ dynamic: true }))


            siparis_channel.send({ content: `${talep_no}`, embeds: [gonderiEmbed], components: [row] }).then((msg) => {
                siparis_channel.send({ content: `<@${interaction.user.id}> en yakın sürede yetkililer gelecektir, bildirim gönderildi.\n\n<@&${siparis_yetkilisi}>` })
                msg.pin().catch((e) => { })
            }).catch((e) => { })

            louritydb.set(`siparisTalebi_${talep_no}`, { creator: interaction.user.id, creator_tag: interaction.user.tag, date: Date.now() })
            // louritydb.set(`siparisTlb_${interaction.user.id}`, siparis_channel.id)
        })

    }

//discord.gg/altyapilar
    if (interaction.customId === "kapat") {

        const sistem = louritydb.get(`ticketSistemi_${interaction.guild.id}`)
        if (!sistem) return interaction.reply({ content: "Sunucuda sipariş sistemi kapalı dostum.", ephemeral: true })
        let siparis_yetkilisi = sistem.siparis_yetkilisi
        let siparis_log = sistem.siparis_log

        if (!interaction.member.roles.cache.has(siparis_yetkilisi)) return await interaction.deferUpdate()
        try {
            const talep_datas = louritydb.get(`siparisTalebi_${interaction.message.content}`)
            let creator = talep_datas.creator
            let creator_tag = talep_datas.creator_tag
            let date = talep_datas.date

            let userAvatar = client.users.cache.get(creator)

            const siparisLogEmbed = new EmbedBuilder()
                .setColor("5865f2")
                .setAuthor({ name: `${creator_tag} Kişisinin sipariş verileri.`, iconURL: userAvatar.avatarURL({ dynamic: true }) })
                .addFields(
                    { name: "Talep Açan:", value: `<@${creator}>`, inline: true },
                    { name: "Talep Açılış Tarihi:", value: `<t:${Math.floor(date / 1000)}:R>`, inline: true },
                    { name: "Talep Numarası:", value: `${interaction.message.content}`, inline: true },
                )
                .setThumbnail(userAvatar.avatarURL({ dynamic: true }) || interaction.user.avatarURL({ dynamic: true }))
                .setFooter({ text: `Talebi Kapatan Yetkili: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

            if (!client.channels.cache.get(siparis_log)) return interaction.reply({ content: "Sipariş sistemi düzgün ayarlanmamış, log kanalını bulamadım!", ephemeral: true })

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Talep Mesajları")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId("siparisMessages")
                )

            const dts = louritydb.fetch(`siparisMesaj_${interaction.channel.id}`)
            if (dts) {
                const data = dts.join("\n")
                if (data) {
                    fs.writeFileSync(`./messageDatas/${interaction.message.content}-talep.txt`, data)
                    client.channels.cache.get(siparis_log).send({ content: `${interaction.message.content}`, embeds: [siparisLogEmbed], components: [row] }).catch(() => { })
                }
            } else {
                client.channels.cache.get(siparis_log).send({ content: `${interaction.message.content} | Bu talepte hiç mesaj yazılmamış.`, embeds: [siparisLogEmbed] }).catch(() => { })
            }

            louritydb.delete(`siparisTalebi_${interaction.message.content}`)
            louritydb.delete(`siparisMesaj_${interaction.channel.id}`)
            // louritydb.delete(`siparisTlb_${interaction.user.id}`)

            interaction.reply({ content: `<@${interaction.user.id}> talebi \`2 saniye\` sonra sonlandırıyorum.` })


            setTimeout(() => {
                interaction.channel.delete().catch(() => { })
            }, 2000)
        } catch {
            louritydb.delete(`siparisTalebi_${interaction.message.content}`)
            louritydb.delete(`siparisMesaj_${interaction.channel.id}`)
            // louritydb.delete(`siparisTlb_${interaction.user.id}`)

            interaction.reply({ content: `<@${interaction.user.id}> talebi \`2 saniye\` sonra sonlandırıyorum.` })

            setTimeout(() => {
                interaction.channel.delete().catch(() => { })
            }, 2000)
        }
    }


    if (interaction.customId === "islem") {

        const sistem = louritydb.get(`ticketSistemi_${interaction.guild.id}`)
        if (!sistem) return interaction.reply({ content: "Sunucuda sipariş sistemi kapalı dostum.", ephemeral: true })
        let siparis_yetkilisi = sistem.siparis_yetkilisi

        if (!interaction.member.roles.cache.has(siparis_yetkilisi)) return await interaction.deferUpdate()

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Talebi Kapat")
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("kapat")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Tamamlandı")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("siparisTamamlandi")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İşlemde")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("siparisİslemde")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İptal")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("siparisİptal")
            )

        interaction.update({ components: [row] }).catch(() => { })
    }

//discord.gg/altyapilar
    if (interaction.customId === "siparisTamamlandi") {

        const sistem = louritydb.get(`ticketSistemi_${interaction.guild.id}`)
        if (!sistem) return interaction.reply({ content: "Sunucuda sipariş sistemi kapalı dostum.", ephemeral: true })
        let siparis_yetkilisi = sistem.siparis_yetkilisi

        if (!interaction.member.roles.cache.has(siparis_yetkilisi)) return await interaction.deferUpdate()

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Talebi Kapat")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("kapat")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Sipariş Tamamlandı")
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("siparisTamamlandi")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Yeni İşlem Başlat")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("islem")
            )

        interaction.update({ components: [row] }).catch(() => { })

        const talep_datas = louritydb.get(`siparisTalebi_${interaction.message.content}`)
        let creator = talep_datas.creator
        let userAvatar = client.users.cache.get(creator)

        const tamamlandiEmbed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`> Siparişin tamamlandı :bell:\n\n💂 Tamamlayan: <@${interaction.user.id}> (**${interaction.user.username}**)\n⏲️ Tamamlanma Tarihi: <t:${Math.floor(Date.now() / 1000)}:R>`)
            .setFooter({ text: `Eğer sorun yaşarsan bize bildirmeyi unutma, görüşmek üzere!` })
            .setThumbnail(userAvatar.avatarURL({ dynamic: true }))

        interaction.channel.send({ content: `<@${creator}>`, embeds: [tamamlandiEmbed] })

    }


    if (interaction.customId === "siparisİslemde") {

        const sistem = louritydb.get(`ticketSistemi_${interaction.guild.id}`)
        if (!sistem) return interaction.reply({ content: "Sunucuda sipariş sistemi kapalı dostum.", ephemeral: true })
        let siparis_yetkilisi = sistem.siparis_yetkilisi

        if (!interaction.member.roles.cache.has(siparis_yetkilisi)) return await interaction.deferUpdate()

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Talebi Kapat")
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("kapat")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Tamamlandı")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("siparisTamamlandi")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İşlemde")
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("siparisİslemde")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İptal")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("siparisİptal")
            )

        interaction.update({ components: [row] }).catch(() => { })
//discord.gg/altyapilar
        const talep_datas = louritydb.get(`siparisTalebi_${interaction.message.content}`)
        let creator = talep_datas.creator
        let userAvatar = client.users.cache.get(creator)

        const islemdeEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setDescription(`> Siparişin işlemde :bell:\n\n💂 İşleme Alan: <@${interaction.user.id}> (**${interaction.user.username}**)\n⏲️ İşlem Tarihi: <t:${Math.floor(Date.now() / 1000)}:R>`)
            .setFooter({ text: `Siparişiniz 24 saat içinde tamamlanır, daha da uzun sürebilir.` })
            .setThumbnail(userAvatar.avatarURL({ dynamic: true }))

        interaction.channel.send({ content: `<@${creator}>`, embeds: [islemdeEmbed] })

    }


    if (interaction.customId === "siparisİptal") {

        const sistem = louritydb.get(`ticketSistemi_${interaction.guild.id}`)
        if (!sistem) return interaction.reply({ content: "Sunucuda sipariş sistemi kapalı dostum.", ephemeral: true })
        let siparis_yetkilisi = sistem.siparis_yetkilisi

        if (!interaction.member.roles.cache.has(siparis_yetkilisi)) return await interaction.deferUpdate()

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Talebi Kapat")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("kapat")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("İşlemi Başlat")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("islem")
            )

        interaction.update({ components: [row] }).catch(() => { })

        const talep_datas = louritydb.get(`siparisTalebi_${interaction.message.content}`)
        let creator = talep_datas.creator
        let userAvatar = client.users.cache.get(creator)

        const iptalEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`> Sipariş reddedildi :bell:\n\n💂 Reddeden Yetkili: <@${interaction.user.id}> (**${interaction.user.username}**)\n⏲️ Rededilme Tarihi: <t:${Math.floor(Date.now() / 1000)}:R>`)
            .setFooter({ text: `İtiraz etmek için yetkiliye bildirebilirsiniz.` })
            .setThumbnail(userAvatar.avatarURL({ dynamic: true }))

        interaction.channel.send({ content: `<@${creator}>`, embeds: [iptalEmbed] })

    }


    if (interaction.customId === "siparisMessages") {
        interaction.reply({ files: [`./messageDatas/${interaction.message.content}-talep.txt`], ephemeral: true })
    }


    if (interaction.customId === "destek") {

        const sistem = louritydb.get(`ticketSistemi_${interaction.guild.id}`)
        if (!sistem) return interaction.reply({ content: "Sunucuda destek sistemi kapalı dostum.", ephemeral: true })

        let me = interaction.guild.members.cache.get(client.user.id)
        if (!me.permissions.has(PermissionsBitField.Flags.Administrator)) {

            const botYetki = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Bunu yapabilmek için yeterli yetkiye sahip değilim.")

            return interaction.reply({ embeds: [botYetki], ephemeral: true })
        }

        let destek_yetkilisi = sistem.destek_yetkilisi
        let destek_kategorisi = sistem.destek_kategorisi


        let destekKategori = interaction.guild.channels.cache.get(destek_kategorisi)

        const destekKategoriYok = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Sipariş sistemi düzgün ayarlanmamış, kategoriyi bulamadım.")

        if (!destekKategori) return interaction.reply({ embeds: [destekKategoriYok], ephemeral: true })

        louritydb.add(`siparisTalepNo_`, 1)

        interaction.guild.channels.create({
            name: `destek-${interaction.user.username}`,
            type: Discord.ChannelType.GuildText,
            parent: destek_kategorisi,

            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [Discord.PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: destek_yetkilisi,
                    allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                }
            ]
        }).then((destek_channel) => {
//discord.gg/altyapilar
            const destekEmbed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`Heyy, senin için bir destek talebi oluşturdum <#${destek_channel.id}>`)

            interaction.reply({ embeds: [destekEmbed], ephemeral: true });

            const talep_no = louritydb.get(`siparisTalepNo_`)

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Talebi Kapat")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId("kapat2")
                )

            const gonderiEmbed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: `Yeni bir destek`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setDescription(`**${interaction.user.username}**, talep kapatılana kadar mesajlar __kayıt edilmektedir__!`)
                .addFields(
                    { name: "Talep Açan:", value: `${interaction.user}`, inline: true },
                    { name: "Talep Açılış Tarihi:", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                )
                .setFooter({ text: `Talep Açan: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setThumbnail(interaction.user.avatarURL({ dynamic: true }) || interaction.guild.iconURL({ dynamic: true }))


            destek_channel.send({ content: `${talep_no}`, embeds: [gonderiEmbed], components: [row] }).then((msg) => {
                destek_channel.send({ content: `<@${interaction.user.id}> en yakın sürede yetkililer gelecektir, bildirim gönderildi.\n\n<@&${destek_yetkilisi}>` })
                msg.pin().catch((e) => { })
            }).catch((e) => { })

            louritydb.set(`destekTalebi_${talep_no}`, { creator: interaction.user.id, creator_tag: interaction.user.tag, date: Date.now() })
            louritydb.set(`destekTlb_${interaction.user.id}`, destek_channel.id)
        })

    }


    if (interaction.customId === "kapat2") {

        const sistem = louritydb.get(`ticketSistemi_${interaction.guild.id}`)
        if (!sistem) return interaction.reply({ content: "Sunucuda sipariş sistemi kapalı dostum.", ephemeral: true })
        let destek_yetkilisi = sistem.destek_yetkilisi
        let destek_log = sistem.destek_log

        if (!interaction.member.roles.cache.has(destek_yetkilisi)) return await interaction.deferUpdate()
        try {
            const talep_datas = louritydb.get(`destekTalebi_${interaction.message.content}`)
            let creator = talep_datas.creator
            let creator_tag = talep_datas.creator_tag
            let date = talep_datas.date

            let userAvatar = client.users.cache.get(creator)

            const destekLogEmbed = new EmbedBuilder()
                .setColor("5865f2")
                .setAuthor({ name: `${creator_tag} Kişisinin sipariş verileri.`, iconURL: userAvatar.avatarURL({ dynamic: true }) })
                .addFields(
                    { name: "Talep Açan:", value: `<@${creator}>`, inline: true },
                    { name: "Talep Açılış Tarihi:", value: `<t:${Math.floor(date / 1000)}:R>`, inline: true },
                    { name: "Talep Numarası:", value: `${interaction.message.content}`, inline: true },
                )
                .setThumbnail(userAvatar.avatarURL({ dynamic: true }) || interaction.user.avatarURL({ dynamic: true }))
                .setFooter({ text: `Talebi Kapatan Yetkili: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

            if (!client.channels.cache.get(destek_log)) return interaction.reply({ content: "Sipariş sistemi düzgün ayarlanmamış, log kanalını bulamadım!", ephemeral: true })

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Talep Mesajları")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId("siparisMessages")
                )

            const dts = louritydb.fetch(`siparisMesaj_${interaction.channel.id}`)
            if (dts) {
                const data = dts.join("\n")
                if (data) {
                    fs.writeFileSync(`./messageDatas/${interaction.message.content}-talep.txt`, data)
                    client.channels.cache.get(destek_log).send({ content: `${interaction.message.content}`, embeds: [destekLogEmbed], components: [row] }).catch(() => { })
                }
            } else {
                client.channels.cache.get(destek_log).send({ content: `${interaction.message.content} | Bu talepte hiç mesaj yazılmamış.`, embeds: [destekLogEmbed] }).catch(() => { })
            }
//discord.gg/altyapilar

            louritydb.delete(`destekTalebi_${interaction.message.content}`)
            louritydb.delete(`siparisMesaj_${interaction.channel.id}`)
            louritydb.delete(`destekTlb_${interaction.user.id}`)

            interaction.reply({ content: `<@${interaction.user.id}> talebi \`2 saniye\` sonra sonlandırıyorum.` })


            setTimeout(() => {
                interaction.channel.delete().catch(() => { })
            }, 2000)
        } catch {
            louritydb.delete(`destekTalebi_${interaction.message.content}`)
            louritydb.delete(`siparisMesaj_${interaction.channel.id}`)
            louritydb.delete(`destekTlb_${interaction.user.id}`)

            interaction.reply({ content: `<@${interaction.user.id}> talebi \`2 saniye\` sonra sonlandırıyorum.` })


            setTimeout(() => {
                interaction.channel.delete().catch(() => { })
            }, 2000)
        }
    }


    const davetModal = new ModalBuilder()
        .setCustomId('davetForm')
        .setTitle('Sunucu Davet Linkinizi Girin')
    const u2 = new TextInputBuilder()
        .setCustomId('davetLink')
        .setLabel('Davet Linkin')
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(5)
        .setMaxLength(40)
        .setPlaceholder('https://discord.gg/altyapilar şeklinde girin.')
        .setRequired(true)

    const row1 = new ActionRowBuilder().addComponents(u2);
    davetModal.addComponents(row1);

    if (interaction.customId === "davet") {
        await interaction.showModal(davetModal);
    }


    if (interaction.customId === "ekledim") {
        await interaction.deferUpdate()
        return interaction.channel.send({ content: `<@${interaction.user.id}> sunucusuna gerekli botu ekledi!` })
    }
})


client.on("messageCreate", async message => {

    if (message.channel.name.includes("sipariş-")) {
        if (message.author?.bot) return;
        louritydb.push(`siparisMesaj_${message.channel.id}`, `${message.author.username} : ${message.content}`)
    }

    if (message.channel.name.includes("destek-")) {
        if (message.author?.bot) return;
        louritydb.push(`siparisMesaj_${message.channel.id}`, `${message.author.username} : ${message.content}`)
    }

})
