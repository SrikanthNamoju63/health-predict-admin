class AnalyticsService {
    constructor() {
        this.baseUrl = '/api/analytics';
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

    async getDashboardStats() {
        return this._request(`${this.baseUrl}/dashboard`);
    }

    async getSalesAnalytics(period, startDate, endDate) {
        const url = new URL(`${this.baseUrl}/sales`, window.location.origin);
        url.searchParams.append('period', period);
        if (startDate) url.searchParams.append('start', startDate);
        if (endDate) url.searchParams.append('end', endDate);
        
        return this._request(url);
    }
}

export const analyticsService = new AnalyticsService();