const Fastify = require('fastify');

const app = Fastify();

// In-memory tasks store
const tasks = new Map();
let nextId = 1;

app.post('/tasks', async (req, reply) => {
  const { title } = req.body;
  const id = String(nextId++);
  tasks.set(id, { id, title, done: false });
  return reply.status(201).send(tasks.get(id));
});

app.get('/tasks', async () => {
  return Array.from(tasks.values());
});

module.exports = app;
