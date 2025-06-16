import { getCurrentUser } from "@/lib/custom-auth";

export const currentUser = async () => {
  return await getCurrentUser();
};

export const currentRole = async () => {
  const user = await getCurrentUser();
  return user?.role;
};
