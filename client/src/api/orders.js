class OrderService {
    constructor() {
        this.baseUrl = '/api/orders';
    }

    async _request(url, method = 'GET', body = null) {
        const token = localStorage.getItem('healthPredictAdminToken');
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

    async getOrders(status = 'all') {
        const url = new URL(this.baseUrl, window.location.origin);
        if (status !== 'all') url.searchParams.append('status', status);
        return this._request(url);
    }

    async getOrdersByDate(range) {
        return this._request(`${this.baseUrl}?range=${range}`);
    }

    async getOrder(id) {
        return this._request(`${this.baseUrl}/${id}`);
    }

    async updateOrderStatus(id, status) {
        return this._request(`${this.baseUrl}/${id}/status`, 'PATCH', { status });
    }

    async cancelOrder(id) {
        return this.updateOrderStatus(id, 'cancelled');
    }
}

export const orderService = new OrderService();