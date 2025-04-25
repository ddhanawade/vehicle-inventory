export class UserModel {
    id: number;
    username: string;
    password: string;
    roles: string[]; // Define roles as an array of strings
    createdDate: Date;

    constructor(data?: Partial<UserModel>) {
        this.id = data?.id || 0;
        this.username = data?.username || '';
        this.password = data?.password || '';
        this.roles = data?.roles || []; // Ensure roles is always an array
        this.createdDate = data?.createdDate ? new Date(data.createdDate) : new Date();
    }
}