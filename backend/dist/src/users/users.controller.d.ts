import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAll(): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
    }[]>;
    getOne(id: string): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
    }>;
    create(createUserDto: CreateUserDto): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
