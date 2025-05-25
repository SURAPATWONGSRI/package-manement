import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function VerificationRequiredAlert() {
  return (
    <Alert
      variant="default"
      className="border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
    >
      <AlertTitle className="text-amber-700 dark:text-amber-300 font-semibold">
        ยืนยันอีเมล
      </AlertTitle>
      <AlertDescription className="text-amber-600 dark:text-amber-400">
        ตรวจสอบอีเมลของคุณและคลิกลิงก์เพื่อยืนยัน
        <br />
        หากไม่พบอีเมลโปรดตรวจสอบในอีเมลขยะ หรือ สแปม
      </AlertDescription>
    </Alert>
  );
}
