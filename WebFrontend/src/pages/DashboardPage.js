import React, { useState } from 'react';
import '../styles/DashboardPage.css';

const THEME_COLORS = [
  '#88C0D0', // nord8
  '#81A1C1', // nord9
  '#5E81AC', // nord10
  '#BF616A', // nord11
  '#D08770', // nord12
  '#EBCB8B', // nord13
  '#A3BE8C', // nord14
  '#B48EAD', // nord15
];

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /** Dashboard displaying project cards and new project creation functionality */
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);
  const [error, setError] = useState('');

  // Mock data - replace with actual API integration
  const projects = [
    { id: 1, title: 'Project Alpha', bugs: 5, tasks: 12, color: '#88C0D0' },
    { id: 2, title: 'Project Beta', bugs: 3, tasks: 8, color: '#BF616A' },
    { id: 3, title: 'Project Gamma', bugs: 0, tasks: 15, color: '#A3BE8C' },
  ];

  const handleCreateProject = (e) => {
    e.preventDefault();
    setError('');

    if (!projectName.trim() || !projectKey.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (projectKey.length < 2 || projectKey.length > 10) {
      setError('Project key must be between 2-10 characters');
      return;
    }

    // TODO: API integration for project creation
    console.log('Creating project:', { projectName, projectKey, selectedColor });
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setProjectName('');
    setProjectKey('');
    setSelectedColor(THEME_COLORS[0]);
    setError('');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Projects</h2>
        <button 
          className="btn create-project-btn" 
          onClick={() => setShowModal(true)}
          aria-label="Create new project"
        >
          Create New Project
        </button>
      </div>

      <div className="project-grid">
        {projects.map(project => (
          <div 
            key={project.id} 
            className="project-card"
            style={{ borderColor: project.color }}
          >
            <h3>{project.title}</h3>
            <div className="project-stats">
              <div className="stat">
                <span className="stat-label">Bugs</span>
                <span className="stat-value">{project.bugs}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Tasks</span>
                <span className="stat-value">{project.tasks}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop" role="presentation">
          <div 
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-project-title"
          >
            <h2 id="new-project-title" className="modal-title">Create New Project</h2>
            
            {error && <div className="error">{error}</div>}
            
            <form className="form" onSubmit={handleCreateProject}>
              <div>
                <label className="label" htmlFor="project-name">Project Name</label>
                <input
                  id="project-name"
                  className="input"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  required
                />
              </div>
              
              <div>
                <label className="label" htmlFor="project-key">Project Key</label>
                <input
                  id="project-key"
                  className="input"
                  type="text"
                  value={projectKey}
                  onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                  placeholder="PRJ"
                  maxLength={10}
                  required
                />
                <span className="input-hint">2-10 characters, uppercase</span>
              </div>

              <div>
                <label className="label">Theme Color</label>
                <div className="color-picker">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select color ${color}`}
                      aria-pressed={selectedColor === color}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
