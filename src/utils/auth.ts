export const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\W)(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

export const decodeJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(escape(window.atob(base64)));
    return JSON.parse(jsonPayload);
};