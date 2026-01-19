import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, 'Password must contain at least 8 characters, including one uppercase letter, one digit, and one special character'),
});

export const registerSchema = z.object({
    childName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, 'Password must contain at least 8 characters, including one uppercase letter, one digit, and one special character'),
    avatarId: z.number(),
    heroName: z.string().min(3, "Hero name is required"),
});
