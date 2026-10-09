import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const passwordHash = await bcrypt.hash(dto.password, 12);

        try {
            return await this.prisma.user.create({
                data: {
                    email: dto.email,
                    passwordHash,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    'A user with this email already exists',
                );
            }

            throw error;
        }
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const passwordMatches = await bcrypt.compare(
            dto.password,
            user.passwordHash,
        );

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
        });

        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: 3600,
        };
    }
}