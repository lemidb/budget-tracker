import db  from '@/app/db';
import { usersTable } from '@/app/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';

export class AuthService {
    async register(email: string, password: string, name: string) {
        // Check if user already exists
        const [existingUser] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const [newUser] = await db
            .insert(usersTable)
            .values({
                email,
                passwordHash: hashedPassword,
                name,
            })
            .returning({
                id: usersTable.id,
                email: usersTable.email,
                name: usersTable.name,
                passwordHash: usersTable.passwordHash,
            });

        // Generate token
        const token = generateToken({
            userId: newUser.id,
            email: newUser.email,
        });

        // Omit passwordHash from the returned user object
        const { passwordHash: _, ...userWithoutPassword } = newUser;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    async login(email: string, password: string) {
        // Find user
        const [user] = await db
            .select({
                id: usersTable.id,
                email: usersTable.email,
                name: usersTable.name,
                passwordHash: usersTable.passwordHash,
            })
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        // Omit passwordHash from the returned user object
        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    // Add a method to get user by ID without sensitive data
    async getUserById(userId: number) {
        const [user] = await db
            .select({
                id: usersTable.id,
                email: usersTable.email,
                name: usersTable.name,
                createdAt: usersTable.createdAt,
            })
            .from(usersTable)
            .where(eq(usersTable.id, userId))
            .limit(1);

        return user || null;
    }
}

export const authService = new AuthService();