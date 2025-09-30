const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://91.108.104.49:5000';

export function getApi(urlEndPoint, options: any = {}) {
    return fetch(baseUrl + urlEndPoint, {
        ...options,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },

    }).then(async response => {
        return response.json();
    });
}

export function PostApi(urlEndPoint, data: any, options: any = {}) {
    return fetch(baseUrl + urlEndPoint, {
        ...options,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        body: JSON.stringify(data),
    }).then(async response => {
        return response.json();
    });
}

export function PutApi(urlEndPoint, data: any, options: any = {}) {
    return fetch(baseUrl + urlEndPoint, {
        ...options,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        body: JSON.stringify(data),
    }).then(async response => {
        return response.json();
    });
}

export function DeleteApi(urlEndPoint, data = {}, options: any = {}) {
    return fetch(baseUrl + urlEndPoint, {
        ...options,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        body: JSON.stringify(data),
    }).then(async response => {
        return response.json();
    });
}
