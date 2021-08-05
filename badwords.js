const pool = require('../pool.js').poolMod;
const settings = require('./settings.json');
const badwords = settings.badwords.list;

module.exports = {
	name: 'badwords',
	execute(message, args, client, edit) {
		for(let i=0;i<settings.badwords.blacklist.channel.length;i++) {
			if(message.channel.id == settings.badwords.blacklist.channel[i]) return;
		}

		const { author, content } = message;

		const msg_content = ' ' +content.toLowerCase() + ' ';

		function getBadword() {
			const finder = elem => msg_content.includes(' ' + elem + ' ');

			const level3 = badwords.level3.find(finder);
			if(typeof level3 === "string") return { word: level3, level: 3 };

			const level2 = badwords.level2.find(finder);
			if(typeof level2 === "string") return { word: level2, level: 2 };

			const level1 = badwords.level1.find(finder);
			if(typeof level1 === "string") return { word: level1, level: 1 };

			return { word: null, level: -1 };
		}

		const level = getBadword().level;
		if(level > 1) {
			message.delete().catch(() => {});
			const badword = getBadword().word;
			const reason = 'Automatic action carried out for sending a message with a bad word';

			pool.getConnection(function(err, con) {
				if(err) throw err;

          // SQL Queries
          // Insert a warning in the database

				con.release();	
			});

			const BadwordsUserEmbed = {
				"title": `You were warned`,
				"description": `**Reason:** Automatic action carried out for sending a message with a bad word \n **Bad word trigger:** ${badword} \n **Whole message:** ${content} \n **Responsible moderator:** HV Moderation#5699 \n **[List of all bad words](https://hage-village.poldisweb.de/hvmod/badwords/)**`,
				"color": 16705372,
				"author": {
					"name": "HV Moderation",
					"url": "https://hage-village.poldisweb.de/hvmod",
					"icon_url": "https://i.ibb.co/kQzzP9G/hvmod-avatar.png"
				}
			};
			author.send({embeds: [BadwordsUserEmbed] })
			.catch(() => {
				message.guild.channels.cache.get('MOD_LOG_CHANNEL_ID').send('Couldn\'t DM badword warn information to' + author.tag);
			});

			const BadwordsEmbed = {
				"title": `badword`,
				"description": `**Offender:** <@${author.id}>\n **Reason:** Automatic action carried out for sending a message with a bad word in <#${message.channel.id}>\n **Bad word trigger:** ${badword} \n **Whole message:** ${content} \n **Level:** ${level} \n **Responsible moderator:** HV Moderation#5699`,
				"color": 16705372
			};
			if(level === 3) {
				message.guild.channels.cache.get('MOD_LOG_CHANNEL_ID').send({ content: `_<@&MODERATION_TEAM_ID> **Level 3 badword detected.** Moderation measures are most likely necessary now!_`, embeds: [BadwordsEmbed] });
			} else {
				message.guild.channels.cache.get('MOD_LOG_CHANNEL_ID').send({embeds: [BadwordsEmbed] });
			}
			
			const OpenLogEmbed = {
				"description": `**Offender:** <@${author.id}> (\`${author.id}\`)\n **Action:** warn\n **Reason:** ${reason}\n **Responsible moderator:** ${client.user.tag} (\`${client.user.id}\`)`,
				"color": 16705372,
				"author": {
					"name": `${author.tag} (${author.id})`,
					"icon_url": `${author.displayAvatarURL({ dynamic: true, size: 2048 })}`
				},
				"footer": {
					"text": `User warned`
				},
				"timestamp": new Date()
			};
			message.guild.channels.cache.get('OPEN_LOG_CHANNEL_ID').send({ embeds: [OpenLogEmbed] });
		} else if(level === 1) {
			message.delete().catch(() => {});
			message.channel.send({ content: `<@${message.author.id}>, please use appropriate language!` })
			.then((msg) => {
				setTimeout(function() {
					msg.delete().catch(() => {});
				}, 7000)
			});
		}
	},
};
