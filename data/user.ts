"use server";

import { db } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};


export const searchUsers = async (query: string) => {
  try {
    const users = await db.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            email: {
              contains: query,
            },
          },
        ],
      },
      include: {
        departments: {
          select: {
            id: true,
            departmentId: true,
          },
        }
      },
    });

    console.log(users);

    return users;
  } catch (error) {
    console.log("error", error);
    return null;
  }
}