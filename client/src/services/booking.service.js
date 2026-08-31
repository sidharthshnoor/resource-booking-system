import api from './api';
import { _mockResources } from './resource.service';

const USE_MOCK = false;

// Pre-populate some mock bookings
export let _mockBookings = [
  {
    id: 'book_1',
    user_id: 'user_1',
    resource_id: 'res_1',
    start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 90000000).toISOString(),
    purpose: 'Quarterly Planning',
    status: 'APPROVED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'book_2',
    user_id: 'user_1',
    resource_id: 'res_2',
    start_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    end_time: new Date(Date.now() + 180000000).toISOString(),
    purpose: 'Client Presentation',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const bookingService = {
  async getMyBookings() {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // In real API, JWT dictates user, here we just return all for simplicity in mock
          // since we only have one mock user really active.
          resolve({ bookings: [..._mockBookings] });
        }, 500);
      });
    }
    return api.get('/bookings');
  },

  async getResourceBookings(resourceId) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const resBookings = _mockBookings.filter(
            b => b.resource_id === resourceId && (b.status === 'PENDING' || b.status === 'APPROVED')
          );
          resolve({ bookings: resBookings });
        }, 500);
      });
    }
    return api.get(`/bookings/resource/${resourceId}`);
  },

  async createBooking(bookingData) {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Basic overlap check in mock
          const overlap = _mockBookings.find(b => 
            b.resource_id === bookingData.resource_id &&
            b.status !== 'REJECTED' &&
            b.status !== 'CANCELLED' &&
            new Date(b.start_time) < new Date(bookingData.end_time) &&
            new Date(b.end_time) > new Date(bookingData.start_time)
          );

          if (overlap) {
            const err = new Error('That time slot is no longer available.');
            err.status = 409;
            return reject(err);
          }

          const newBooking = {
            id: 'book_' + Date.now(),
            user_id: 'user_1', // mocked active user
            resource_id: bookingData.resource_id,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time,
            purpose: bookingData.purpose,
            status: 'PENDING',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          _mockBookings.push(newBooking);
          resolve({ booking: newBooking });
        }, 600);
      });
    }
    return api.post('/bookings', bookingData);
  },

  async cancelBooking(id) {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const bookingIndex = _mockBookings.findIndex(b => b.id === id);
          if (bookingIndex >= 0) {
            _mockBookings[bookingIndex].status = 'CANCELLED';
            resolve({ success: true });
          } else {
            const err = new Error('Booking not found');
            err.status = 404;
            reject(err);
          }
        }, 400);
      });
    }
    return api.delete(`/bookings/${id}`);
  }
};

export default bookingService;
