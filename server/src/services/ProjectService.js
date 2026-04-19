const ProjectRepository = require('../repositories/ProjectRepository');
const UserRepository = require('../repositories/UserRepository');
const PermissionService = require('./PermissionService');
const { ValidationError, ForbiddenError } = require('../utils/errors');

class ProjectService {
  async createProject(projectData, user) {
    if (!PermissionService.hasRole(user, 'MANAGER')) {
      throw new ForbiddenError('Only managers can create projects');
    }

    this.validateProjectData(projectData);

    projectData.managerId = user.id;
    const project = await ProjectRepository.save(projectData);

    // Add manager as member
    await ProjectRepository.addMember(project.id, user.id);

    return project;
  }

  async updateProject(projectId, updateData, user) {
    const project = await ProjectRepository.findById(projectId);
    
    if (!project) {
      throw new ValidationError('Project not found');
    }

    if (!PermissionService.canAccessProject(user, project)) {
      throw new ForbiddenError('You do not have permission to update this project');
    }

    this.validateProjectData(updateData, true);

    return await ProjectRepository.update(projectId, updateData);
  }

  async deleteProject(projectId, user) {
    const project = await ProjectRepository.findById(projectId);
    
    if (!project) {
      throw new ValidationError('Project not found');
    }

    if (!PermissionService.canAccessProject(user, project)) {
      throw new ForbiddenError('You do not have permission to delete this project');
    }

    await ProjectRepository.delete(projectId);
    return { message: 'Project deleted successfully' };
  }

  async addTeamMember(projectId, userId, user) {
    const project = await ProjectRepository.findById(projectId);
    
    if (!project) {
      throw new ValidationError('Project not found');
    }

    if (!PermissionService.canAccessProject(user, project)) {
      throw new ForbiddenError('You do not have permission to manage this project');
    }

    const member = await UserRepository.findById(userId);
    if (!member) {
      throw new ValidationError('User not found');
    }

    await ProjectRepository.addMember(projectId, userId);
    
    return { message: 'Team member added successfully' };
  }

  async removeTeamMember(projectId, userId, user) {
    const project = await ProjectRepository.findById(projectId);
    
    if (!project) {
      throw new ValidationError('Project not found');
    }

    if (!PermissionService.canAccessProject(user, project)) {
      throw new ForbiddenError('You do not have permission to manage this project');
    }

    await ProjectRepository.removeMember(projectId, userId);
    
    return { message: 'Team member removed successfully' };
  }

  async getProjectById(projectId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new ValidationError('Project not found');
    }
    return project;
  }

  async getProjectsByManager(managerId) {
    return await ProjectRepository.findByUserAsManagerOrMember(managerId);
  }

  async getAllProjects(filters = {}) {
    return await ProjectRepository.findAll(filters);
  }

  async getProjectAnalytics(projectId, user) {
    const project = await ProjectRepository.findById(projectId);
    
    if (!project) {
      throw new ValidationError('Project not found');
    }

    const isMember = await project.isMember(user.id);
    if (!isMember && user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have access to this project');
    }

    return await ProjectRepository.getAnalytics(projectId);
  }

  validateProjectData(projectData, isUpdate = false) {
    if (!isUpdate) {
      if (!projectData.name) {
        throw new ValidationError('Project name is required');
      }
    }

    if (projectData.name && projectData.name.length > 200) {
      throw new ValidationError('Project name must be less than 200 characters');
    }

    if (projectData.status && !['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].includes(projectData.status)) {
      throw new ValidationError('Invalid project status');
    }
  }
}

module.exports = new ProjectService();
