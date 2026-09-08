import api from './api';

const superAdminService = {
  async getOrganizations() {
    return api.get('/super-admin/organizations');
  },

  async getOrganization(id) {
    return api.get(`/super-admin/organizations/${id}`);
  },

  async createOrganization(data) {
    return api.post('/super-admin/organizations', data);
  },

  async updateOrganizationStatus(id, status) {
    return api.patch(`/super-admin/organizations/${id}/status`, { status });
  },

  async provisionAdmin(id, data) {
    return api.post(`/super-admin/organizations/${id}/admins`, data);
  },

  async deleteOrganization(id) {
    return api.delete(`/super-admin/organizations/${id}`);
  }
};

export default superAdminService;
