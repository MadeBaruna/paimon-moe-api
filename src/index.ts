import fastify from 'fastify';

const server = fastify({ logger: { level: 'error' } });

void server.register(import('./routes/version'));

async function start(): Promise<void> {
  try {
    const address = await server.listen(3001, '0.0.0.0');
    console.log(`Server listening at ${address}`);
  } catch (err) {
    console.error('Server failed to start!');
    console.error(err);
  }
}

void start();
