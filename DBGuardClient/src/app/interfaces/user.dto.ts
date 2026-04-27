export interface UserDTO {
    id: number;
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