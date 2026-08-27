import api from './api';
import { _mockResources } from './resource.service';
import { _mockBookings } from './booking.service';

const USE_MOCK = false;

const adminService = {
  // --- Admin Bookings ---
  async getAllBookings() {
    if (USE_MOCK) {
      return new Promise(resolve => {
        setTimeout(() => resolve({ bookings: [..._mockBookings] }), 500);
      });
    }
    return api.get('/admin/bookings');
  },

  async approveBooking(id) {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const booking = _mockBookings.find(b => b.id === id);
          if (booking) {
            booking.status = 'APPROVED';
            resolve({ booking });
          } else {
            const err = new Error('Booking not found');
            err.status = 404;
            reject(err);
          }
        }, 400);
      });
    }
    return api.put(`/admin/bookings/${id}/approve`);
  },

  async rejectBooking(id) {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const booking = _mockBookings.find(b => b.id === id);
          if (booking) {
            booking.status = 'REJECTED';
            resolve({ booking });
          } else {
            const err = new Error('Booking not found');
            err.status = 404;
            reject(err);
          }
        }, 400);
      });
    }
    return api.put(`/admin/bookings/${id}/reject`);
  },

  // --- Admin Resources ---
  async createResource(resourceData) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newRes = {
            id: 'res_' + Date.now(),
            ...resourceData,
            status: resourceData.status || 'AVAILABLE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          _mockResources.push(newRes);
          resolve({ resource: newRes });
        }, 500);
      });
    }
    return api.post('/resources', resourceData);
  },

  async updateResource(id, resourceData) {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const idx = _mockResources.findIndex(r => r.id === id);
          if (idx >= 0) {
            _mockResources[idx] = { ..._mockResources[idx], ...resourceData, updated_at: new Date().toISOString() };
            resolve({ resource: _mockResources[idx] });
          } else {
            const err = new Error('Resource not found');
            err.status = 404;
            reject(err);
          }
        }, 500);
      });
    }
    return api.put(`/resources/${id}`, resourceData);
  },

  async deleteResource(id) {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const idx = _mockResources.findIndex(r => r.id === id);
          if (idx >= 0) {
            _mockResources.splice(idx, 1);
            resolve({ success: true });
          } else {
            const err = new Error('Resource not found');
            err.status = 404;
            reject(err);
          }
        }, 400);
      });
    }
    return api.delete(`/resources/${id}`);
  }
};

export default adminService;
