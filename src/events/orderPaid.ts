import { Order } from '@polar-sh/sdk/models/components/order.js';
import { defaultColor, discord, docsUrl, productKeys, redis, sendDM } from '../common.js';
import { s } from '@fallencodes/seyfert-utils';
import { createContainer, createSeparator, createTextDisplay } from '@fallencodes/seyfert-utils/components/message';
import Guild from '../models/Guild.js';
import User from '../models/User.js';
import { MessageFlags } from 'seyfert/lib/types/index.js';

export default async (order: Order) => {
	const productKey = productKeys[order.productId!];
    if (!productKey) return;

	switch (productKey) {
		case 'user-license': await activateUserLicense(order); break;
		case 'guild-license': await activateGuildLicense(order); break;
	};
};

const orderDisclaimer = createTextDisplay(
	`-# Keep your Order ID safe, it's the only way to recover or transfer this license.`
);

async function activateGuildLicense(order: Order) {
    const guildId = String(order.metadata.activeGuildId);
	console.log(guildId);

	await Guild.findOneAndUpdate(
		{ guildId },
		{ $set: { active: true } },
		{ upsert: true, returnDocument: 'after' }
	);

	await redis.del(`fs_guild:${guildId}`);
	const guild = await discord.guilds(guildId).get();

    const lines = [
        `### :tada: | Server License Activated\n`,
        `Thank you for purchasing a Fyre Server License!\n`,
        `Your server now has access to all of Fyre's features. `,
		`To get started or learn more, visit the ${docsUrl}.\n\n`,
		`**Server**: ||${s(guild.name)} [\`${guild.id}\`]||\n`,
        `**Order ID**: ||\`${order.id}\`||`
    ];

	const container = createContainer([
		createTextDisplay(lines.join('')),
		createSeparator(),
		orderDisclaimer
	], { color: defaultColor });

	await sendDM(order.customer.externalId!, {
		flags: MessageFlags.IsComponentsV2,
		components: [container.toJSON()]
	});
};

async function activateUserLicense(order: Order) {
    const activeUserId = String(order.metadata.activeUserId);

	await User.findOneAndUpdate(
		{ userId: activeUserId },
		{ $set: { active: true } },
		{ upsert: true, returnDocument: 'after' }
	);

	await redis.del(`fs_user:${activeUserId}`);
    const purchaserId = order.customer.externalId!;

	const activeUser = await discord.users(activeUserId).get();
	const activeUserName = s(`${activeUser.global_name ?? activeUser.username} (@${activeUser.username})`);

	if (activeUserId !== purchaserId) {
        const subscriber = await discord.users(purchaserId).get();
		const subscriberName = s(`${subscriber.global_name ?? subscriber.username} (@${subscriber.username})`);

		const lines = [
			`### :tada: | User License Gifted\n`,
			`${subscriberName} has gifted you a Fyre User License!\n`,
			`You now have access to all of Fyre's user features. `,
			`To get started or learn more, visit the ${docsUrl}.`
		];

		const container = createContainer(
			[createTextDisplay(lines.join(''))],
			{ color: defaultColor }
		);

		await sendDM(activeUserId, {
			flags: MessageFlags.IsComponentsV2,
			components: [container.toJSON()]
		});
	};

    const lines = [
        `### :tada: | User License Activated\n`,
		'Thank you for purchasing a Fyre User License!',
    ];

	if (activeUserId === purchaserId) lines.push(
		`\nYou now have access to all of Fyre's user features. `,
		`To get started or learn more, visit the ${docsUrl}.`
	);

	lines.push(
		`\n\n**User**: ||${activeUserName}||`,
        `\n**Order ID**: ||\`${order.id}\`||`
	);

	const container = createContainer([
		createTextDisplay(lines.join('')),
		createSeparator(),
		orderDisclaimer
	], { color: defaultColor });

    await sendDM(purchaserId, {
		flags: MessageFlags.IsComponentsV2,
		components: [container.toJSON()]
	});
};
