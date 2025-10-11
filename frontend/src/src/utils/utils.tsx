import { jwtDecode } from 'jwt-decode';

export function getEmailFromToken(token) {
    try {
        const decoded = jwtDecode(token);
        console.log(decoded)
        return decoded?.['sub'] || null;
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}
