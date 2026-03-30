const express = require('express');
const router = express.Router();

let notes = [];
let nextId = 1;

router.post('/', (req, res) => {
  const { title, body } = req.body;
  const note = { id: nextId++, title, body };
  notes.push(note);
  res.status(201).json(note);
});

router.get('/', (req, res) => {
  res.json(notes);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const note = notes.find(n => n.id === id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json(note);
});

module.exports = router;
