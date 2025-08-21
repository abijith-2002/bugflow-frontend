import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../services/api';
import { 
  Plus, 
  Search, 
  FolderOpen, 
  Users, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';

// PUBLIC_INTERFACE
const Projects = () => {
  /**
   * Projects page component for managing projects
   * @returns {JSX.Element} Projects page
   */
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getProjects();
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error mb-4">{error}</p>
        <button 
          onClick={fetchProjects}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Projects</h1>
          <p className="text-muted">Manage your development projects</p>
        </div>
        <button 
          onClick={() => console.log('Create project modal would open here')}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FolderOpen size={24} style={{ color: 'var(--accent-primary)' }} />
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedProject(project)}
                  className="p-1 hover:bg-tertiary rounded"
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              <p className="text-muted text-sm mb-4 line-clamp-3">
                {project.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Users size={16} />
                  <span>{project.members?.length || 0} members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Calendar size={16} />
                  <span>Created {formatDate(project.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-subtle">
                <div className="flex items-center gap-2">
                  <span className="badge badge-low">
                    {project.bugs_count || 0} bugs
                  </span>
                </div>
                <Link 
                  to={`/bugs?project=${project.id}`}
                  className="text-primary hover:underline text-sm"
                >
                  View Bugs
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderOpen size={48} className="mx-auto mb-4 text-muted" />
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted mb-4">
            {searchTerm ? 'No projects match your search.' : 'Get started by creating your first project.'}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => console.log('Create project modal would open here')}
              className="btn btn-primary"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Project Actions Dropdown */}
      {selectedProject && (
        <>
          <div 
            className="dropdown-overlay"
            onClick={() => setSelectedProject(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="card" style={{ width: '300px' }}>
              <h3 className="font-semibold mb-4">{selectedProject.name}</h3>
              <div className="space-y-2">
                <button className="dropdown-item w-full">
                  <Edit size={16} />
                  Edit Project
                </button>
                <button className="dropdown-item w-full text-error">
                  <Trash2 size={16} />
                  Delete Project
                </button>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="btn btn-secondary w-full mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Projects;
