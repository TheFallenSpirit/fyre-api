import { Subscription } from '@polar-sh/sdk/models/components/subscription.js';
import { defaultColor, discord, fyreHub, logsChannelId, redis, sendDM } from '../common.js';
import Guild from '../models/Guild.js';
import { s } from '@fallencodes/seyfert-utils';
import { createContainer, createSeparator, createTextDisplay } from '@fallencodes/seyfert-utils/components/message';
import { MessageFlags } from 'seyfert/lib/types/index.js';

export default async (subscription: Subscription, productKey: string) => {
	if (productKey !== 'proxy-subscription') return;

	const guildId = subscription.metadata.activeGuildId!.toString();
	await Guild.updateOne({ guildId }, { $addToSet: { featureFlags: ['customAppProxy'] } }, { upsert: true });
	await redis.del(`fs_guild:${guildId}`);
	const guild = await discord.guilds(guildId).get();

	const lines = [
		`### 🎉 | Custom App Proxy Subscription Activated\n`,
		`Thank you for purchasing or renewing your Custom App Proxy Subscription!\n\n`,
		`Visit the [Proxy Guide](<https://fyre.bot/docs/guides/proxy>) on the `,
		'Fyre Docs to setup your Custom App Proxy.\n\n',
		`**Server**: ||${s(guild.name)} [\`${guild.id}\`]||\n`,
		`**Subscription ID**: ||\`${subscription.id}\`||\n\n`,
		`To cancel this subscription, make a billing support ticket in ${fyreHub}.`
	];

	const container = createContainer([
		createTextDisplay(lines.join('')),
		createSeparator(),
		createTextDisplay(`-# Keep your Subscription ID safe, it's the only way to recieve support with this subscription.`)
	], { color: defaultColor });

	await sendDM(subscription.customer.externalId!, {
		flags: MessageFlags.IsComponentsV2,
		components: [container.toJSON()]
	});

	await discord.channels(logsChannelId).messages.post({
		body: {
			content: `Custom App Proxy subscription activated.\nGuild ID: \`${guildId}\``
		}
	});
};
