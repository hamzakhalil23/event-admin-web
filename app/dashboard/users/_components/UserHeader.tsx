import type { User } from "../../../../types";

interface Props {
  users: User[];
}

export default function UserHeader({ users }: Props) {
  const activeCount   = users.filter((u) => u.isActive).length;
  const verifiedCount = users.filter((u) => u.emailVerified).length;

  return (
    <div className="mb-8">
      <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Manage</p>
      <h1 className="mt-1 text-3xl font-extrabold text-stone-900">Users</h1>
      <p className="mt-1 text-stone-500">
        {users.length} registered &bull; {activeCount} active &bull; {verifiedCount} verified
      </p>
    </div>
  );
}
