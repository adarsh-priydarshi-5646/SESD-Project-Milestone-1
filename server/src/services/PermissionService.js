class PermissionService {
  checkPermission(user, action) {
    const rolePermissions = {
      ADMIN: ['*'],
      MANAGER: [
        'CREATE_PROJECT',
        'UPDATE_PROJECT',
        'DELETE_PROJECT',
        'ASSIGN_TASK',
        'VIEW_ANALYTICS',
        'MANAGE_TEAM',
        'CREATE_TASK',
        'UPDATE_ANY_TASK',
        'DELETE_ANY_TASK'
      ],
      TEAM_MEMBER: [
        'VIEW_TASKS',
        'CREATE_TASK',
        'UPDATE_OWN_TASKS',
        'ADD_COMMENTS',
        'UPLOAD_FILES'
      ]
    };

    if (user.role === 'ADMIN') return true;
    
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(action);
  }

  canUpdateTask(user, task) {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'MANAGER') return true;
    return task.assigneeId === user.id || task.createdBy === user.id;
  }

  canDeleteTask(user, task) {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'MANAGER') return true;
    return task.createdBy === user.id;
  }

  canAccessProject(user, project) {
    if (user.role === 'ADMIN') return true;
    return project.managerId === user.id;
  }

  hasRole(user, requiredRole) {
    const roleHierarchy = {
      ADMIN: 3,
      MANAGER: 2,
      TEAM_MEMBER: 1
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }
}

module.exports = new PermissionService();
