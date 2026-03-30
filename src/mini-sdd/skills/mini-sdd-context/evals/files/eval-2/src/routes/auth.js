import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import pool from '../db/postgres.js'

export async function authRoutes(app) {
  app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hash]
    )
    res.json({ user: rows[0] })
  })

  app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token })
  })

  app.get('/auth/me', async (req, res) => {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'Missing token' })
    const token = auth.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [payload.userId])
    res.json({ user: rows[0] })
  })
}
