import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface ReturnButtonProps {
  href: string;
  label: string;
}

const ReturnButton = ({ href, label }: ReturnButtonProps) => {
  return (
    <Button size="sm" asChild>
      <Link href={href}>
        <ChevronLeft /> <span>{label}</span>
      </Link>
    </Button>
  );
};

export default ReturnButton;
