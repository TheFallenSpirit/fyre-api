import { Context } from 'hono';
import { BlankEnv, BlankInput } from 'hono/types';
import { redis } from '../common.js';

export default async (context: Context<BlankEnv, '/testimonials', BlankInput>) => {
	const rawTestimonials = await redis.smembers(`fs_web_testimonials`);
	const testimonials = rawTestimonials.map((t) => JSON.parse(t));

	return context.json({
		error: false,
		data: testimonials
	});
};
