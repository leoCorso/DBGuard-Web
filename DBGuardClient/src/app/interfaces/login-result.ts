export interface AuthResult {
    userId?: string,
    message?: string,
    success: boolean,
    accessToken?: string,
    refreshToken?: string
}