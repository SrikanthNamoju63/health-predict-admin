class MedicineService {
    constructor() {
        this.BASE_URL = 'http://localhost:5000/api'; // Base API URL
        this.baseEndpoint = '/medicines'; // API endpoint
    }

    async _request(endpoint, method = 'GET', body = null) {
        const token = localStorage.getItem('healthPredictAdminToken');
        const url = `${this.BASE_URL}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }

        return response.json();
    }

    async getMedicines(search = '', category = 'all') {
        const endpoint = new URL(this.baseEndpoint, this.BASE_URL);
        if (search) endpoint.searchParams.append('search', search);
        if (category !== 'all') endpoint.searchParams.append('category', category);
        
        return this._request(endpoint.pathname + endpoint.search);
    }

    async getMedicine(id) {
        return this._request(`${this.baseEndpoint}/${id}`);
    }

    async addMedicine(medicine) {
        return this._request(this.baseEndpoint, 'POST', medicine);
    }

    async updateMedicine(id, updates) {
        return this._request(`${this.baseEndpoint}/${id}`, 'PUT', updates);
    }

    async deleteMedicine(id) {
        return this._request(`${this.baseEndpoint}/${id}`, 'DELETE');
    }

    async importMedicines(medicines) {
        return this._request(`${this.baseEndpoint}/import`, 'POST', { medicines });
    }

    async getCategories() {
        return this._request(`${this.baseEndpoint}/categories`);
    }

    async getLowStock(threshold = 10) {
        return this._request(`${this.baseEndpoint}/low-stock?threshold=${threshold}`);
    }
}

export const medicineService = new MedicineService();