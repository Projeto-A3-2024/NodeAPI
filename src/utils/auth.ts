export const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\W)(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};