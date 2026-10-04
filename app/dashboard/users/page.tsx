import { Suspense } from "react";
import { serverFetch } from "../../../lib/server-fetch";
import type { User } from "../../../types";
import UserHeader from "./_components/UserHeader";
import UserFilter from "./_components/UserFilter";
import UserTable from "./_components/UserTable";

interface UsersResponse {
  success: boolean;
  data: User[];
}

export default async function UsersPage() {
  const result = await serverFetch<UsersResponse>("/user?limit=500");

  if (!result?.success) {
    throw new Error("Failed to load users");
  }

  const users = result.data ?? [];

  return (
    <div>
      <UserHeader users={users} />
      <Suspense>
        <UserFilter users={users} />
        <UserTable users={users} />
      </Suspense>
    </div>
  );
}
