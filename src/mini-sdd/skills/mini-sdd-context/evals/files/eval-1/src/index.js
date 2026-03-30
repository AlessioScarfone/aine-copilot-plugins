import Fastify from 'fastify'
import cors from '@fastify/cors'
import { taskRoutes } from './routes/tasks.js'
import { projectRoutes } from './routes/projects.js'

const app = Fastify({ logger: true })

app.register(cors)
app.register(taskRoutes, { prefix: '/tasks' })
app.register(projectRoutes, { prefix: '/projects' })

app.listen({ port: process.env.PORT ?? 3000 }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
