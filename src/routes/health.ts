import { Context } from 'hono';
import { BlankEnv, BlankInput } from 'hono/types';
import { discord } from '../common.js';

export default async (context: Context<BlankEnv, '/health', BlankInput>) => {
	const fyreHub = await discord.guilds('1370922624397606952').get().catch(() => undefined);

	if (!fyreHub) return context.json({
		error: true,
		messages: ['Unable to contact the Discord API.']
	}, 500);

	return context.json({
		error: false
	});
};
