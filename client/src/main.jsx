import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowUpRight, BarChart3, Bell, CalendarDays, Check, CheckCircle2,
  ChevronDown, Circle, Clock3, Filter, LayoutDashboard, MoreHorizontal,
  Plus, Search, Settings, Sparkles, Target, Trash2, Users, X
} from 'lucide-react';
import './styles.css';

const columns = [
  { id: 'todo', title: 'To do', color: '#94a3b8', icon: Circle },
  { id: 'in-progress', title: 'In progress', color: '#f59e0b', icon: Clock3 },
  { id: 'done', title: 'Completed', color: '#22c55e', icon: CheckCircle2 }
];

const initials = ['AK', 'JD', 'MS'];

function App() {
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/tasks')
      .then((response) => {
        if (!response.ok) throw new Error('Could not load tasks.');
        return response.json();
      })
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.description} ${task.tag}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = activeFilter === 'all' || task.priority === activeFilter;
    return matchesQuery && matchesFilter;
  }), [tasks, query, activeFilter]);

  const stats = {
    total: tasks.length,
    done: tasks.filter((task) => task.status === 'done').length,
    active: tasks.filter((task) => task.status === 'in-progress').length,
    high: tasks.filter((task) => task.priority === 'high').length
  };

  async function updateTask(id, changes) {
    const response = await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) });
    if (!response.ok) throw new Error('Could not update task.');
    const updated = await response.json();
    setTasks((current) => current.map((task) => task.id === id ? updated : task));
  }

  async function deleteTask(id) {
    const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Could not delete task.');
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  async function addTask(task) {
    const response = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) });
    if (!response.ok) throw new Error('Could not create task.');
    const created = await response.json();
    setTasks((current) => [created, ...current]);
    setShowModal(false);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><span>TaskFlow <b>Pro</b></span></div>
        <div className="workspace-switcher"><div className="workspace-avatar">T</div><div><strong>Team workspace</strong><small>Product team</small></div><ChevronDown size={16} /></div>
        <nav>
          <p className="nav-label">Workspace</p>
          <a className="nav-item active"><LayoutDashboard size={18} /> Overview</a>
          <a className="nav-item"><CheckCircle2 size={18} /> My tasks <span className="nav-count">{stats.total}</span></a>
          <a className="nav-item"><CalendarDays size={18} /> Calendar</a>
          <a className="nav-item"><BarChart3 size={18} /> Analytics</a>
          <p className="nav-label">Manage</p>
          <a className="nav-item"><Users size={18} /> Members</a>
          <a className="nav-item"><Settings size={18} /> Settings</a>
        </nav>
        <div className="sidebar-footer"><div className="upgrade-card"><Sparkles size={18} /><strong>Make progress visible</strong><p>Keep your team aligned with one clear view of the work.</p><button>Explore Pro <ArrowUpRight size={14} /></button></div><div className="profile"><div className="avatar">AK</div><div><strong>Aqsa Khan</strong><small>Administrator</small></div><MoreHorizontal size={18} /></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <b>Overview</b></div><div className="top-actions"><div className="status-dot"><span /> All systems operational</div><button className="icon-button"><Bell size={19} /><i /></button><div className="avatar avatar-small">AK</div></div></header>
        <section className="page-heading"><div><p className="eyebrow">Wednesday, November 19, 2026</p><h1>Good evening, Aqsa <span>✦</span></h1><p className="subtitle">Here’s what’s happening across your workspace today.</p></div><button className="primary-button" onClick={() => setShowModal(true)}><Plus size={18} /> New task</button></section>

        <section className="stat-grid">
          <StatCard label="Total tasks" value={stats.total} detail="+12% from last week" icon={Target} tone="purple" />
          <StatCard label="In progress" value={stats.active} detail="Keep the momentum going" icon={Activity} tone="orange" />
          <StatCard label="Completed" value={stats.done} detail={`${stats.total ? Math.round(stats.done / stats.total * 100) : 0}% completion rate`} icon={CheckCircle2} tone="green" />
          <StatCard label="High priority" value={stats.high} detail="Needs your attention" icon={Bell} tone="red" />
        </section>

        <section className="board-section">
          <div className="section-heading"><div><h2>Project board</h2><p>Organize and prioritize your team's work.</p></div><div className="board-actions"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." /></div><div className="filter-wrap"><Filter size={16} /><select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}><option value="all">All priorities</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select></div></div></div>
          {error && <div className="error-banner">{error}</div>}
          {loading ? <div className="loading-state">Loading your workspace...</div> : <div className="board">{columns.map((column) => <Column key={column.id} column={column} tasks={visibleTasks.filter((task) => task.status === column.id)} onMove={updateTask} onDelete={deleteTask} />)}</div>}
        </section>
      </main>
      {showModal && <TaskModal onClose={() => setShowModal(false)} onCreate={addTask} />}
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20} /></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div><ArrowUpRight className="stat-arrow" size={17} /></div>;
}

function Column({ column, tasks, onMove, onDelete }) {
  const Icon = column.icon;
  return <div className="column"><div className="column-heading"><div className="column-title"><Icon size={17} color={column.color} /><h3>{column.title}</h3><span>{tasks.length}</span></div><button className="ghost-button"><MoreHorizontal size={18} /></button></div><div className="task-list">{tasks.map((task) => <TaskCard key={task.id} task={task} onMove={onMove} onDelete={onDelete} />)}{tasks.length === 0 && <div className="empty-column">No matching tasks</div>}</div><button className="add-task-button"><Plus size={16} /> Add task</button></div>;
}

function TaskCard({ task, onMove, onDelete }) {
  return <article className={`task-card priority-${task.priority}`}><div className="task-card-top"><span className={`priority-pill ${task.priority}`}>{task.priority}</span><button className="ghost-button" onClick={() => onDelete(task.id)} aria-label="Delete task"><Trash2 size={15} /></button></div><h4>{task.title}</h4><p>{task.description}</p><div className="task-meta"><span className="tag">{task.tag}</span>{task.dueDate && <span className="due-date"><CalendarDays size={13} /> {task.dueDate.slice(5).replace('-', '/')}</span>}</div><div className="task-footer"><div className="avatar avatar-tiny">{task.assignee || initials[task.id % initials.length]}</div><select aria-label="Change task status" value={task.status} onChange={(event) => onMove(task.id, { status: event.target.value })}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Completed</option></select><button className="complete-button" onClick={() => onMove(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}>{task.status === 'done' ? <Check size={14} /> : 'Complete'}</button></div></article>;
}

function TaskModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', tag: 'General', dueDate: '' });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal" onSubmit={(event) => { event.preventDefault(); onCreate(form); }}><div className="modal-heading"><div><p className="eyebrow">Workspace task</p><h2>Create a new task</h2></div><button type="button" className="ghost-button" onClick={onClose}><X size={20} /></button></div><label>Task title<input autoFocus required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="What needs to be done?" /></label><label>Description<textarea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Add context for your team..." rows="3" /></label><div className="form-grid"><label>Priority<select value={form.priority} onChange={(event) => update('priority', event.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Due date<input type="date" value={form.dueDate} onChange={(event) => update('dueDate', event.target.value)} /></label></div><label>Tag<input value={form.tag} onChange={(event) => update('tag', event.target.value)} placeholder="e.g. Product" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit"><Plus size={17} /> Create task</button></div></form></div>;
}

createRoot(document.getElementById('root')).render(<App />);
