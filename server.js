const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let tasks = [
  { id: 1, title: 'Design the onboarding flow', description: 'Create a clear first-run experience for new team members.', status: 'in-progress', priority: 'high', assignee: 'AK', dueDate: '2026-11-24', tag: 'Design' },
  { id: 2, title: 'Connect analytics events', description: 'Track the key actions that matter for project health.', status: 'todo', priority: 'medium', assignee: 'JD', dueDate: '2026-11-27', tag: 'Engineering' },
  { id: 3, title: 'Review sprint backlog', description: 'Remove stale work and prepare the next sprint scope.', status: 'done', priority: 'low', assignee: 'MS', dueDate: '2026-11-20', tag: 'Planning' },
  { id: 4, title: 'Prepare release notes', description: 'Summarize the improvements shipping this week.', status: 'todo', priority: 'medium', assignee: 'AK', dueDate: '2026-11-29', tag: 'Launch' },
  { id: 5, title: 'Improve dashboard empty states', description: 'Make every first-use screen feel helpful and actionable.', status: 'in-progress', priority: 'low', assignee: 'JD', dueDate: '2026-12-01', tag: 'Product' }
];

app.get('/api/tasks', (req, res) => res.json(tasks));

app.post('/api/tasks', (req, res) => {
  const { title, description = '', priority = 'medium', tag = 'General', dueDate = '' } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'A task title is required.' });
  const task = { id: Date.now(), title: title.trim(), description, priority, tag, dueDate, status: 'todo', assignee: 'AK' };
  tasks = [task, ...tasks];
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return res.status(404).json({ error: 'Task not found.' });
  tasks[index] = { ...tasks[index], ...req.body, id };
  res.json(tasks[index]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const before = tasks.length;
  tasks = tasks.filter((task) => task.id !== id);
  if (tasks.length === before) return res.status(404).json({ error: 'Task not found.' });
  res.status(204).end();
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
  app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html')));
}

app.listen(port, () => console.log(`TaskFlow Pro API listening on http://localhost:${port}`));