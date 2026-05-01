import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  FolderPlus,
  LogOut,
  Plus,
  RefreshCw,
  Shield,
  Users
} from 'lucide-react';
import { api } from './api.js';

const statuses = [
  { value: 'TODO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' }
];

const priorities = ['LOW', 'MEDIUM', 'HIGH'];

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      localStorage.setItem('token', data.token);
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f9ff] px-4 py-10">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-[#5c61d6] shadow-sm">
            <Shield size={16} /> Admin and Member workspaces
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-normal text-[#1d2740] sm:text-5xl">
            Team Task Manager
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5f6d84]">
            Create projects, invite teammates, assign work, and keep delivery visible with role-based access and a focused dashboard.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['Projects', 'Assignments', 'Progress'].map((item) => (
              <div key={item} className="rounded-xl border border-[#e2e8f3] bg-white p-4 shadow-sm">
                <CheckCircle2 className="mb-3 text-[#5f6eff]" size={22} />
                <p className="font-medium text-[#1d2740]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="rounded-xl border border-[#e2e8f3] bg-white p-6 shadow-sm">
          <div className="mb-6 flex rounded-xl bg-[#f1f4ff] p-1">
            {['login', 'signup'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                  mode === item ? 'bg-white text-[#1d2740] shadow-sm' : 'text-[#6f7b92] hover:text-[#4b579f]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {mode === 'signup' && (
            <label className="mb-4 block">
              <span className="mb-1 block text-sm font-medium text-[#4d5a72]">Name</span>
              <input
                className="w-full rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
          )}

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-[#4d5a72]">Email</span>
            <input
              type="email"
              className="w-full rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-[#4d5a72]">Password</span>
            <input
              type="password"
              className="w-full rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>

          {error && <p className="mb-4 rounded-lg bg-[#ffecef] px-3 py-2 text-sm text-[#9f3146]">{error}</p>}

          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#7b70ff] px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#6960ed] disabled:opacity-60"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Shield size={18} />}
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  );
}

function Stat({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white text-[#1d2740]',
    warning: 'bg-[#fff6e5] text-[#8a6014]',
    success: 'bg-[#ebfbf4] text-[#2c8b72]'
  };

  return (
    <div className={`rounded-xl border border-[#e2e8f3] p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [memberForm, setMemberForm] = useState({ email: '', role: 'MEMBER' });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    assigneeId: ''
  });

  const selectedMembership = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId]
  );
  const isAdmin = selectedProject?.role === 'ADMIN' || selectedMembership?.role === 'ADMIN';

  const loadEverything = async () => {
    setError('');
    const [projectData, taskData] = await Promise.all([api('/projects'), api('/tasks')]);
    setProjects(projectData.projects);
    setTasks(taskData.tasks);
    setDashboard(taskData.dashboard);

    if (!selectedProjectId && projectData.projects[0]) {
      setSelectedProjectId(projectData.projects[0].id);
    }
  };

  const loadProject = async (projectId) => {
    if (!projectId) {
      setSelectedProject(null);
      return;
    }
    const data = await api(`/projects/${projectId}`);
    setSelectedProject(data.project);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadEverything().catch((err) => setError(err.message));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadProject(selectedProjectId).catch((err) => setError(err.message));
  }, [selectedProjectId, user]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProjects([]);
    setSelectedProject(null);
  };

  const createProject = async (event) => {
    event.preventDefault();
    const data = await api('/projects', { method: 'POST', body: JSON.stringify(projectForm) });
    setProjectForm({ name: '', description: '' });
    setProjects([data.project, ...projects]);
    setSelectedProjectId(data.project.id);
  };

  const addMember = async (event) => {
    event.preventDefault();
    await api(`/projects/${selectedProjectId}/members`, { method: 'POST', body: JSON.stringify(memberForm) });
    setMemberForm({ email: '', role: 'MEMBER' });
    await loadProject(selectedProjectId);
  };

  const createTask = async (event) => {
    event.preventDefault();
    await api('/tasks', {
      method: 'POST',
      body: JSON.stringify({ ...taskForm, projectId: selectedProjectId, dueDate: taskForm.dueDate || null, assigneeId: taskForm.assigneeId || null })
    });
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '' });
    await Promise.all([loadEverything(), loadProject(selectedProjectId)]);
  };

  const updateStatus = async (taskId, status) => {
    await api(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await Promise.all([loadEverything(), loadProject(selectedProjectId)]);
  };

  if (!user) {
    return <AuthScreen onAuth={setUser} />;
  }

  const projectTasks = selectedProject?.tasks || [];

  return (
    <main className="min-h-screen bg-[#f7f9ff]">
      <header className="border-b border-[#e2e8f3] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d2740]">Team Task Manager</h1>
            <p className="text-sm text-[#6f7b92]">{user.name} · {user.email}</p>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-[#d8e0ec] px-3 py-2 text-sm font-semibold text-[#4d5a72] transition hover:bg-[#f3f6ff]">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <form onSubmit={createProject} className="rounded-xl border border-[#e2e8f3] bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><FolderPlus size={18} /> New project</h2>
            <input
              placeholder="Project name"
              className="mb-2 w-full rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]"
              value={projectForm.name}
              onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })}
            />
            <textarea
              placeholder="Description"
              rows="3"
              className="mb-3 w-full rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]"
              value={projectForm.description}
              onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })}
            />
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#7b70ff] px-3 py-2 font-semibold text-white shadow-sm transition hover:bg-[#6960ed]"><Plus size={16} /> Create</button>
          </form>

          <div className="rounded-xl border border-[#e2e8f3] bg-white p-3 shadow-sm">
            <h2 className="mb-2 px-1 font-semibold">Projects</h2>
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition ${selectedProjectId === project.id ? 'border-[#7b70ff] bg-[#eef0ff]' : 'border-[#e2e8f3] bg-white hover:bg-[#f6f9ff]'}`}
                >
                  <span className="block font-medium">{project.name}</span>
                  <span className="mt-1 block text-sm text-[#6f7b92]">{project.role} · {project.progress}% done</span>
                </button>
              ))}
              {!projects.length && <p className="px-1 py-3 text-sm text-[#6f7b92]">Create your first project to begin.</p>}
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          {error && <p className="rounded-lg bg-[#ffecef] px-3 py-2 text-sm text-[#9f3146]">{error}</p>}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Stat label="All tasks" value={dashboard?.total || 0} />
            <Stat label="My tasks" value={dashboard?.mine || 0} />
            <Stat label="In progress" value={dashboard?.inProgress || 0} />
            <Stat label="Done" value={dashboard?.done || 0} tone="success" />
            <Stat label="Overdue" value={dashboard?.overdue || 0} tone="warning" />
          </div>

          {selectedProject ? (
            <>
              <div className="rounded-xl border border-[#e2e8f3] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{selectedProject.name}</h2>
                    <p className="mt-1 text-[#6f7b92]">{selectedProject.description || 'No description yet.'}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f1f4ff] px-3 py-1 text-sm font-semibold text-[#4d5a72]">
                    <Shield size={15} /> {selectedProject.role}
                  </span>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  {isAdmin && (
                    <form onSubmit={createTask} className="rounded-xl border border-[#e2e8f3] bg-white p-4 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 font-semibold"><ClipboardList size={18} /> Create task</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input className="rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]" placeholder="Title" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} />
                        <select className="rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]" value={taskForm.assigneeId} onChange={(event) => setTaskForm({ ...taskForm, assigneeId: event.target.value })}>
                          <option value="">Unassigned</option>
                          {selectedProject.memberships.map((membership) => (
                            <option key={membership.user.id} value={membership.user.id}>{membership.user.name}</option>
                          ))}
                        </select>
                        <select className="rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]" value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}>
                          {priorities.map((priority) => <option key={priority}>{priority}</option>)}
                        </select>
                        <input type="date" className="rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]" value={taskForm.dueDate} onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })} />
                      </div>
                      <textarea rows="2" className="mt-3 w-full rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]" placeholder="Description" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} />
                      <button className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#7b70ff] px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-[#6960ed]"><Plus size={16} /> Add task</button>
                    </form>
                  )}

                  <div className="grid gap-3">
                    {projectTasks.map((task) => (
                      <article key={task.id} className="rounded-xl border border-[#e2e8f3] bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{task.title}</h3>
                            <p className="mt-1 text-sm text-[#6f7b92]">{task.description || 'No details.'}</p>
                            <p className="mt-2 text-sm text-[#4d5a72]">
                              {task.assignee ? `Assigned to ${task.assignee.name}` : 'Unassigned'} {task.dueDate ? `· Due ${new Date(task.dueDate).toLocaleDateString()}` : ''}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#f1f4ff] px-2 py-1 text-xs font-semibold text-[#4b579f]">{task.priority}</span>
                            <select className="rounded-lg border border-[#d8e0ec] px-2 py-1 text-sm outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]" value={task.status} onChange={(event) => updateStatus(task.id, event.target.value)}>
                              {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                            </select>
                          </div>
                        </div>
                      </article>
                    ))}
                    {!projectTasks.length && <p className="rounded-xl border border-dashed border-[#d8e0ec] bg-white p-8 text-center text-[#6f7b92]">No tasks in this project yet.</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-[#e2e8f3] bg-white p-4 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold"><Users size={18} /> Team</h3>
                    <div className="space-y-2">
                      {selectedProject.memberships.map((membership) => (
                        <div key={membership.id} className="rounded-lg border border-[#e2e8f3] px-3 py-2">
                          <p className="font-medium">{membership.user.name}</p>
                          <p className="text-sm text-[#6f7b92]">{membership.user.email} · {membership.role}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isAdmin && (
                    <form onSubmit={addMember} className="rounded-xl border border-[#e2e8f3] bg-white p-4 shadow-sm">
                      <h3 className="mb-3 font-semibold">Add member</h3>
                      <input className="mb-2 w-full rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]" placeholder="Member email" value={memberForm.email} onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })} />
                      <select className="mb-3 w-full rounded-lg border border-[#d8e0ec] px-3 py-2 outline-none transition focus:border-[#7c83ff] focus:ring-2 focus:ring-[#dde0ff]" value={memberForm.role} onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value })}>
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#7b70ff] px-3 py-2 font-semibold text-white shadow-sm transition hover:bg-[#6960ed]"><Plus size={16} /> Add</button>
                    </form>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-[#d8e0ec] bg-white p-10 text-center text-[#6f7b92]">Select or create a project.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
