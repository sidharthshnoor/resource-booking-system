import api from './api';

const USE_MOCK = false;

// Pre-populate some resources for testing
let _mockResources = [
  {
    id: 'res_1',
    name: 'Conference Room A',
    description: 'Large conference room with projector and whiteboard.',
    type: 'ROOM',
    location: 'Floor 1, North Wing',
    capacity: 12,
    status: 'AVAILABLE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'res_2',
    name: 'Projector Pro 2000',
    description: 'Portable 4K projector for presentations.',
    type: 'EQUIPMENT',
    location: 'IT Storage Room',
    capacity: 1,
    status: 'AVAILABLE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'res_3',
    name: 'Company Van',
    description: '8-seater van for company events.',
    type: 'VEHICLE',
    location: 'Parking Bay 4',
    capacity: 8,
    status: 'MAINTENANCE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const resourceService = {
  async getAllResources() {
    if (USE_MOCK) {
      return new Promise(resolve => {
        setTimeout(() => resolve({ resources: [..._mockResources] }), 500);
      });
    }
    return api.get('/resources');
  },

  async getResourceById(id) {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const res = _mockResources.find(r => r.id === id);
          if (res) resolve({ resource: res });
          else {
            const err = new Error('Not found');
            err.status = 404;
            reject(err);
          }
        }, 300);
      });
    }
    return api.get(`/resources/${id}`);
  }
};

export { _mockResources }; // Exported for admin mock mutation
export default resourceService;
