import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import testimonials from './routes/testimonials.js';
import billing from './routes/billing.js';
import { connect } from 'mongoose';

await connect(process.env.MONGO_URL ?? '', { dbName: 'bot' })
.then(() => console.log('Successfully connected to MongoDB.'))
.catch(() => console.error('Failed to connect to MongoDB!'));

const app = new Hono();

app.get('/testimonials', testimonials);
app.post('/billing', billing);

app.all('*', (context) => context.json({
	error: true,
	messages: [`The specified route '${context.req.method}:${context.req.path}' wasn't found.`]
}, 404));

serve({
	port: 7000,
	fetch: app.fetch,
	hostname: '0.0.0.0'
}, (info) => {
	console.log(`Successfully listening on ${info.address}:${info.port}.`)
});
