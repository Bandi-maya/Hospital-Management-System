const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.hms.logybyte.in/tenant/7';

export function getApi(urlEndPoint, options: any = {}, isAccountInfo = false) {
    const token = localStorage.getItem('auth_token');

    return fetch((!isAccountInfo ? baseUrl : baseUrl.split('/tenant')[0]) + urlEndPoint, {
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

export function DownloadApi(urlEndPoint, format, type) {
    const token = localStorage.getItem('auth_token');

    return fetch(baseUrl + urlEndPoint, {
        method: 'GET',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },

    }).then(async response => {
        const blob = await response.blob();
        const fileName = format === 'excel' ? `${type}.xlsx` : `${type}.csv`;

        // 🔹 Create a link element and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    });
}

export function PostApi(urlEndPoint, data: any, options: any = {}, isAccountInfo = false) {
    const token = localStorage.getItem('auth_token');
    return fetch((!isAccountInfo ? baseUrl : baseUrl.split('/tenant')[0]) + urlEndPoint, {
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

export function PutApi(urlEndPoint, data: any, options: any = {}, isAccountInfo = false) {
    const token = localStorage.getItem('auth_token');
    return fetch((!isAccountInfo ? baseUrl : baseUrl.split('/tenant')[0]) + urlEndPoint, {
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

export function PostFormDataApi(urlEndPoint, data: any, options: any = {}, isAccountInfo=false) {
    const token = localStorage.getItem('auth_token');
    return fetch((!isAccountInfo ? baseUrl : baseUrl.split('/tenant')[0]) + urlEndPoint, {
        ...options,
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },
        body: data,
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

export function PutFormDataApi(urlEndPoint, data: any, options: any = {}, isAccountInfo=false) {
    const token = localStorage.getItem('auth_token');
    return fetch((!isAccountInfo ? baseUrl : baseUrl.split('/tenant')[0]) + urlEndPoint, {
        ...options,
        method: 'PUT',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },
        body: data,
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
