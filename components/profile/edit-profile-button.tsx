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
      className="w-full gap-2 px-3 max-[270px]:px-2 max-[270px]:text-xs sm:w-auto"
      onClick={() => router.push(`/upload/confirm?edit=true&memberId=${memberId}`)}
    >
      <Pencil className="h-4 w-4 shrink-0"/>
      Edit Profile
    </Button>
  );
}
