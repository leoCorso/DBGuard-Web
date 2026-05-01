export interface AuthResult {
    message?: string,
    success: boolean,
    accessToken?: string,
    expiration?: Date,
    username?: string,
    roles: string[]
}