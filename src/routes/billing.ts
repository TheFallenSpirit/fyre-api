import { validateEvent } from '@polar-sh/sdk/webhooks.js';
import { Context } from 'hono';
import { BlankEnv, BlankInput } from 'hono/types';
import orderPaid from '../events/orderPaid.js';

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
			messages: [`The provided event body and signature are invalid.`]
		}, 400);
	};

	if (!event) return context.json({
		error: true,
		messages: [`The provided event body and signature are invalid.`]
	}, 400);

	switch (event.type) {
        case 'order.paid': orderPaid(event.data); break;
    };

    return context.json({ error: false, data: null });
};
