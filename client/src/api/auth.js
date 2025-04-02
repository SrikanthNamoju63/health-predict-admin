class AuthService {
    constructor() {
        this.tokenKey = 'healthPredictAdminToken';
        this.BASE_URL = 'http://localhost:5000/api'; // Base URL for all API requests
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.BASE_URL}/auth/login`, {  // Updated URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem(this.tokenKey, data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('adminUser');
    }

    async getCurrentUser() {
        const token = localStorage.getItem(this.tokenKey);
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${this.BASE_URL}/auth/me`, {  // Updated URL
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Session expired');
            }

            return await response.json();
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    async updateAccount(updates) {
        const token = localStorage.getItem(this.tokenKey);
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${this.BASE_URL}/auth/update`, {  // Updated URL
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Update failed');
            }

            const data = await response.json();
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            return data.user;
        } catch (error) {
            console.error('Update error:', error);
            throw error;
        }
    }
}

export const authService = new AuthService();