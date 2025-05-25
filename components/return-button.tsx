import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface ReturnButtonProps {
  href: string;
  label: string;
}

const ReturnButton = ({ href, label }: ReturnButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className="flex items-center gap-1.5 hover:bg-muted/80 transition-colors"
    >
      <Link href={href} className="flex items-center">
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>{label}</span>
      </Link>
    </Button>
  );
};

export default ReturnButton;
