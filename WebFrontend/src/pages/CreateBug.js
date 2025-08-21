import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bugsApi, projectsApi } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

// PUBLIC_INTERFACE
const CreateBug = () => {
  /**
   * Create bug page component for reporting new bugs
   * @returns {JSX.Element} Create bug page
   */
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    project_id: '',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Combine description with additional fields
      const fullDescription = [
        formData.description,
        formData.steps_to_reproduce && `\n**Steps to Reproduce:**\n${formData.steps_to_reproduce}`,
        formData.expected_behavior && `\n**Expected Behavior:**\n${formData.expected_behavior}`,
        formData.actual_behavior && `\n**Actual Behavior:**\n${formData.actual_behavior}`
      ].filter(Boolean).join('\n');

      const bugData = {
        title: formData.title,
        description: fullDescription,
        priority: formData.priority,
        project_id: formData.project_id || null
      };

      const newBug = await bugsApi.createBug(bugData);
      navigate(`/bugs/${newBug.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create bug');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/bugs')}
          className="p-2 hover:bg-tertiary rounded"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-4xl font-bold mb-2">Report Bug</h1>
          <p className="text-muted">Submit a new bug report</p>
        </div>
      </div>

      {error && (
        <div className="card border-error">
          <p className="text-error">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Main Form */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Bug Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Bug Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input"
                    placeholder="Brief description of the bug"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input textarea"
                    rows={4}
                    placeholder="Detailed description of the bug"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="steps_to_reproduce" className="block text-sm font-medium mb-2">
                    Steps to Reproduce
                  </label>
                  <textarea
                    id="steps_to_reproduce"
                    name="steps_to_reproduce"
                    value={formData.steps_to_reproduce}
                    onChange={handleChange}
                    className="input textarea"
                    rows={3}
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                  />
                </div>

                <div>
                  <label htmlFor="expected_behavior" className="block text-sm font-medium mb-2">
                    Expected Behavior
                  </label>
                  <textarea
                    id="expected_behavior"
                    name="expected_behavior"
                    value={formData.expected_behavior}
                    onChange={handleChange}
                    className="input textarea"
                    rows={2}
                    placeholder="What should happen"
                  />
                </div>

                <div>
                  <label htmlFor="actual_behavior" className="block text-sm font-medium mb-2">
                    Actual Behavior
                  </label>
                  <textarea
                    id="actual_behavior"
                    name="actual_behavior"
                    value={formData.actual_behavior}
                    onChange={handleChange}
                    className="input textarea"
                    rows={2}
                    placeholder="What actually happened"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Classification</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium mb-2">
                    Priority *
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="select input"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <p className="text-xs text-muted mt-1">
                    Select the appropriate priority level
                  </p>
                </div>

                <div>
                  <label htmlFor="project_id" className="block text-sm font-medium mb-2">
                    Project
                  </label>
                  <select
                    id="project_id"
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    className="select input"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted mt-1">
                    Associate this bug with a project
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">Tips for Good Bug Reports</h3>
              <ul className="text-sm text-muted space-y-2">
                <li>• Be specific and descriptive in your title</li>
                <li>• Include clear steps to reproduce the issue</li>
                <li>• Describe what you expected vs what happened</li>
                <li>• Set appropriate priority level</li>
                <li>• Include screenshots if helpful</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-subtle">
          <button
            type="button"
            onClick={() => navigate('/bugs')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            {loading ? (
              <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
            ) : (
              <Save size={16} />
            )}
            {loading ? 'Creating...' : 'Create Bug'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBug;
