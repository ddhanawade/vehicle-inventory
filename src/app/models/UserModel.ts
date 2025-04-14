export class UserModel {

    id: number;
    username: string;
    password: string;
    role: string;
    createdDate: Date;

    constructor(data?: Partial<UserModel>) {
        this.id = data?.id || 0;
        this.username = data?.username || '';
        this.password = data?.password || '';
        this.role = data?.role || '';
        this.createdDate = data?.createdDate ? new Date(data.createdDate) : new Date();
    }

}