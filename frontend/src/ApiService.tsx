const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/';

export function getApi(urlEndPoint, options: any = {}) {
    const token = localStorage.getItem('auth_token');

    return fetch(baseUrl + urlEndPoint, {
        ...options,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },

    }).then(async response => {
        let data = await response.json()
        if (data?.['msg'] === 'Token has expired') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authTimestamp');
            localStorage.removeItem('userRole');
        }
        return data;
    });
}

export function PostApi(urlEndPoint, data: any, options: any = {}) {
    const token = localStorage.getItem('auth_token');
    return fetch(baseUrl + urlEndPoint, {
        ...options,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },
        body: JSON.stringify(data),
    }).then(async response => {
        let data = await response.json()
        if (data?.['msg'] === 'Token has expired') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authTimestamp');
            localStorage.removeItem('userRole');
        }
        return data;
    });
}

export function PutApi(urlEndPoint, data: any, options: any = {}) {
    const token = localStorage.getItem('auth_token');
    return fetch(baseUrl + urlEndPoint, {
        ...options,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },
        body: JSON.stringify(data),
    }).then(async response => {
        let data = await response.json()
        if (data?.['msg'] === 'Token has expired') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authTimestamp');
            localStorage.removeItem('userRole');
        }
        return data;
    });
}

export function PatchApi(urlEndPoint, data: any, options: any = {}) {
    const token = localStorage.getItem('auth_token');
    return fetch(baseUrl + urlEndPoint, {
        ...options,
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },
        body: JSON.stringify(data),
    }).then(async response => {
        let data = await response.json()
        if (data?.['msg'] === 'Token has expired') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authTimestamp');
            localStorage.removeItem('userRole');
        }
        return data;
    });
}

export function DeleteApi(urlEndPoint, data = {}, options: any = {}) {
    const token = localStorage.getItem('auth_token');
    return fetch(baseUrl + urlEndPoint, {
        ...options,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },
        body: JSON.stringify(data),
    }).then(async response => {
        let data = await response.json()
        if (data?.['msg'] === 'Token has expired') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authTimestamp');
            localStorage.removeItem('userRole');
        }
        return data;
    });
}
