import api from './api';

// MOCK DATA STORE
// This represents the structure of the data the backend will send.
let _mockUsers = [];
let _mockCurrentUser = null;

// The UI specifies we can use mock data if needed to make it functional.
// We'll use mock data until the backend is fully connected, but shape it identically.
const USE_MOCK = false;

const authService = {
  async register(userData) {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (_mockUsers.find(u => u.email === userData.email)) {
            return reject(new Error('Email already in use'));
          }
          const newUser = {
            id: String(Date.now()),
            name: userData.name,
            email: userData.email,
            role: 'USER', // Default role
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          _mockUsers.push(newUser);
          
          const token = 'mock_jwt_token_' + newUser.id;
          localStorage.setItem('rbs_token', token);
          _mockCurrentUser = newUser;
          
          resolve({ token, user: newUser });
        }, 800);
      });
    }
    
    // Real implementation
    await api.post('/auth/register', userData);
    const loginRes = await this.login({ email: userData.email, password: userData.password });
    return loginRes;
  },
  
  async login(credentials) {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Hardcode an admin for testing if none exists
          if (credentials.email === 'admin@rbs.com' && credentials.password === 'admin123') {
            const adminUser = {
              id: 'admin_1',
              name: 'Admin User',
              email: 'admin@rbs.com',
              role: 'ADMIN',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            const token = 'mock_jwt_token_admin_1';
            localStorage.setItem('rbs_token', token);
            _mockCurrentUser = adminUser;
            return resolve({ token, user: adminUser });
          }
          
          // Hardcode a normal user
          if (credentials.email === 'user@rbs.com' && credentials.password === 'user123') {
             const regularUser = {
              id: 'user_1',
              name: 'Regular User',
              email: 'user@rbs.com',
              role: 'USER',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            const token = 'mock_jwt_token_user_1';
            localStorage.setItem('rbs_token', token);
            _mockCurrentUser = regularUser;
            return resolve({ token, user: regularUser });
          }

          const user = _mockUsers.find(u => u.email === credentials.email);
          if (user) {
            const token = 'mock_jwt_token_' + user.id;
            localStorage.setItem('rbs_token', token);
            _mockCurrentUser = user;
            resolve({ token, user });
          } else {
            const err = new Error('Invalid credentials');
            err.status = 401;
            reject(err);
          }
        }, 800);
      });
    }
    
    // Real implementation
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('rbs_token', response.token);
    return response;
  },
  
  async getMe() {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const token = localStorage.getItem('rbs_token');
          if (!token) {
            const err = new Error('Unauthorized');
            err.status = 401;
            return reject(err);
          }
          
          if (_mockCurrentUser) {
            resolve({ user: _mockCurrentUser });
          } else if (token === 'mock_jwt_token_admin_1') {
            resolve({ user: { id: 'admin_1', name: 'Admin User', email: 'admin@rbs.com', role: 'ADMIN' } });
          } else if (token === 'mock_jwt_token_user_1') {
             resolve({ user: { id: 'user_1', name: 'Regular User', email: 'user@rbs.com', role: 'USER' } });
          } else {
             const id = token.replace('mock_jwt_token_', '');
             const user = _mockUsers.find(u => u.id === id);
             if (user) resolve({ user });
             else {
               const err = new Error('Unauthorized');
               err.status = 401;
               reject(err);
             }
          }
        }, 300);
      });
    }
    
    // Real implementation
    return api.get('/auth/me');
  },
  
  logout() {
    localStorage.removeItem('rbs_token');
    _mockCurrentUser = null;
  },

  async inviteUser(email) {
    if (USE_MOCK) return { success: true };
    return api.post('/auth/invite', { email });
  },

  async createAccount(data) {
    if (USE_MOCK) return { success: true };
    return api.post('/auth/create-account', data);
  },

  async forgotPassword(email) {
    if (USE_MOCK) return { success: true, message: 'If an account exists for this email, a password reset link has been sent.' };
    return api.post('/auth/forgot-password', { email });
  },

  async resendReset(email) {
    if (USE_MOCK) return { success: true, message: 'If an account exists for this email, a password reset link has been sent.' };
    return api.post('/auth/resend-reset', { email });
  },

  async resetPassword(data) {
    if (USE_MOCK) return { success: true };
    return api.post('/auth/reset-password', data);
  }
};

export default authService;
