import { Subscription } from '@polar-sh/sdk/models/components/subscription.js';
import { defaultColor, discord, sendDM } from '../common.js';
import { s } from '@fallencodes/seyfert-utils';
import { createContainer, createTextDisplay } from '@fallencodes/seyfert-utils/components/message';
import { MessageFlags } from 'seyfert/lib/types/index.js';

export default async (subscription: Subscription, productKey: string) => {
	if (productKey !== 'proxy-subscription') return;
	
	const guildId = subscription.metadata.activeGuildId!.toString();
	const guild = await discord.guilds(guildId).get();

	const lines = [
		'### ✅ | Custom App Proxy Subscription Resumed\n',
		'Your Custom App Proxy subscription has been resumed.\n\n',
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
};
