"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface EditProfileButtonProps {
  memberId: string;
}

export function EditProfileButton({ memberId }: EditProfileButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={() => router.push(`/profile/${memberId}/edit`)}
    >
      <Pencil className="h-4 w-4" />
      Edit Profile
    </Button>
  );
}
