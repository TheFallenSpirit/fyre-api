import { validateEvent } from '@polar-sh/sdk/webhooks.js';
import { Context } from 'hono';
import { BlankEnv, BlankInput } from 'hono/types';
import orderPaid from '../events/orderPaid.js';
import subscriptionActive from '../events/subscriptionActive.js';
import subscriptionRevoked from '../events/subscriptionRevoked.js';
import subscriptionCancelled from '../events/subscriptionCancelled.js';
import subscriptionUnCancelled from '../events/subscriptionUnCancelled.js';
import { productKeys } from '../common.js';

export default async (context: Context<BlankEnv, '/billing', BlankInput>) => {
	let event: ReturnType<typeof validateEvent> | undefined;

	try {
		event = validateEvent(
			await context.req.text(),
			context.req.header(),
			process.env.POLAR_WEBHOOK_SECRET ?? ''
		);
	} catch (error) {
		console.error(error);
		return context.json({
			error: true,
			messages: ['The provided event body and signature are invalid.']
		}, 400);
	};

	if (!event) return context.json({
		error: true,
		messages: ['The provided event body and signature are invalid.']
	}, 400);

	let productKey: string | undefined;
	if ('productId' in event.data) productKey = event.data.productId ?? undefined;
	if (!productKey) return context.json({ error: true, messages: ['Unknown product.'] });

	productKey = productKeys[productKey];
	if (!productKey) return context.json({ error: true, messages: ['Unknown product.'] });

	switch (event.type) {
		case 'order.paid': orderPaid(event.data, productKey); break;
		case 'subscription.active': subscriptionActive(event.data, productKey); break;
		case 'subscription.revoked': subscriptionRevoked(event.data, productKey); break;
		case 'subscription.canceled': subscriptionCancelled(event.data, productKey); break;
		case 'subscription.uncanceled': subscriptionUnCancelled(event.data, productKey); break;
	};

	return context.json({ error: false, data: null });
};
