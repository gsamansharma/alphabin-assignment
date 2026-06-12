import { Card, Avatar } from '@heroui/react';
import { User } from '@/types';

export function UserCard({ user }: { user: User }) {
  return (
    <Card className="border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/80 p-5 flex items-center gap-4 transition-colors rounded-xl shadow-none">
      <Avatar className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center font-medium text-xs shrink-0 select-none">
        <Avatar.Fallback>
          {user.name[0].toUpperCase()}
        </Avatar.Fallback>
      </Avatar>
      
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-zinc-100 truncate">{user.name}</h3>
        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
      </div>
    </Card>
  );
}
