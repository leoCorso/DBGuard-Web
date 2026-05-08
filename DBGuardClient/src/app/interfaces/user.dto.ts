export interface UserDTO {
    id: string;
    username: string;
    createDate: Date,
    lastEdited: Date,
    createdByUserId?: number,
    createdByUsername?: string,
    isActive: boolean
}

export interface UserDetailDTO {
    id: number;
    username: string;
    createDate: Date,
    lastEdited: Date,
    createdByUserId?: number,
    createdByUsername?: string,
    roles: string[],
    isActive: boolean
}
export interface CreateUserDTO {
    id?: string,
    username: string,
    password: string,
    confirmPassword: string,
    roles: string[],
    isActive: boolean
}
export interface CreateUserReferenceData {
    roles: string[]
}
export interface ViewUserSelfDTO {
    id: string,
    username: string,
    roles: string[]
}
export interface EditSelfUsernameDTO {
    id: string,
    newUsername: string
}
export interface EditSelfPasswordDTO {
    id: string,
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
}