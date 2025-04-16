'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  department: z.string().refine(val => ['admin', 'staff'].includes(val), {
    message: "Department must be either 'admin' or 'staff'"
  })
});

export async function authenticateUser(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const department = formData.get('department');

  try {
    const validatedData = loginSchema.parse({ email, department });

    const user = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        department: validatedData.department,
      },
      select: {
        id: true,
        email: true,
        department: true,
        first_name: true,
        last_name: true,
      }
    });

    if (!user) {
      return { 
        error: 'Invalid credentials',
        success: false 
      };
    }

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: crypto.randomUUID(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    });

    // Redirect based on department
    const redirectPath = user.department === 'admin' ? '/staffhome' : '/staffportal';
    revalidatePath(redirectPath);
    
    return { 
      success: true,
      user,
      redirect: redirectPath
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        error: 'Invalid input data',
        success: false,
        validationErrors: error.errors 
      };
    }
    
    return { 
      error: 'Authentication failed',
      success: false 
    };
  }
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        department: true,
      }
    });
    return users;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
}

export async function searchMembers(searchTerm: string) {
  try {
    if (!searchTerm) return [];
    
    const members = await prisma.fnmember.findMany({
      where: {
        OR: [
          { first_name: { contains: searchTerm, mode: 'insensitive' } },
          { last_name: { contains: searchTerm, mode: 'insensitive' } },
          { t_number: { contains: searchTerm, mode: 'insensitive' } },
          { contact_number: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        created: true,
        updated: true,
        birthdate: true,
        first_name: true,
        last_name: true,
        t_number: true,
        gender: true,
        o_r_status: true,
        community: true,
        contact_number: true,
        option: true,
        email: true,
      }
    });
    
    // Serialize dates before returning
    return members.map(member => ({
      ...member,
      created: member.created.toISOString(),
      updated: member.updated.toISOString(),
      birthdate: member.birthdate.toISOString(),
    }));
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search members');
  }
}

export async function getItems() {
  try {
    const items = await prisma.fnmember.findMany({
      select: {
        id: true,
        created: true,
        updated: true,
        birthdate: true,
        first_name: true,
        last_name: true,
        t_number: true,
        gender: true,
        o_r_status: true,
        community: true,
        contact_number: true,
        option: true,
        email: true,
      }
    });
    return items;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw new Error('Failed to fetch items');
  }
}
