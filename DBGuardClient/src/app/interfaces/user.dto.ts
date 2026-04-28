export interface UserDTO {
    id: string;
    username: string;
    createDate: Date,
    lastEdited: Date,
    createdByUserId?: number,
    createdByUsername?: string
}

export interface UserDetailDTO {
    id: number;
    username: string;
    createDate: Date,
    lastEdited: Date,
    createdByUserId?: number,
    createdByUsername?: string,
    roles: string[]
}
export interface CreateUserDTO {
    id?: string,
    username: string,
    password: string,
    confirmPassword: string,
    roles: string[]
}
export interface CreateUserReferenceData {
    roles: string[]
}