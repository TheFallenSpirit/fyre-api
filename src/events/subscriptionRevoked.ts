import { Subscription } from '@polar-sh/sdk/models/components/subscription.js';
import { defaultColor, discord, logsChannelId, redis, sendDM } from '../common.js';
import Guild from '../models/Guild.js';
import { s } from '@fallencodes/seyfert-utils';
import { createContainer, createTextDisplay } from '@fallencodes/seyfert-utils/components/message';
import { MessageFlags } from 'seyfert/lib/types/index.js';

export default async (subscription: Subscription, productKey: string) => {
	if (productKey !== 'proxy-subscription') return;

	const guildId = subscription.metadata.activeGuildId!.toString();
	await Guild.updateOne({ guildId }, { $pull: { featureFlags: ['customAppProxy'] } }, { upsert: true });
	await redis.del(`fs_guild:${guildId}`);
	const guild = await discord.guilds(guildId).get();

	const lines = [
		'### ❌ | Custom App Proxy Subscription Revoked\n',
		'Your Custom App Proxy subscription has expired and is no longer active.\n\n',
		`**Server**: ||${s(guild.name)} [\`${guild.id}\`]||\n`,
		`**Subscription ID**: ||\`${subscription.id}\`||`
	];

	const container = createContainer([
		createTextDisplay(lines.join(''))
	], { color: defaultColor });

	await sendDM(subscription.customer.externalId!, {
		flags: MessageFlags.IsComponentsV2,
		components: [container.toJSON()]
	});

	await discord.channels(logsChannelId).messages.post({
		body: {
			content: `Custom App Proxy subscription revoked.\nGuild ID: \`${guildId}\``
		}
	});
};
