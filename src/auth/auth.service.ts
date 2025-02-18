import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupDto } from '../dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@tenbou/test-shared-lib';
@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async signup(signupDto: SignupDto) : Promise<User> {
        // Check if user already exists
        const user = await this.prisma.user.findUnique({
            where: { email: signupDto.email }
        })
        if (user) {
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST)
        }
        // Create user
        const newUser = await this.prisma.user.create({
            data: signupDto
        })
        return newUser
}
