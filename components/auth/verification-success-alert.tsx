import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function VerificationSuccessAlert() {
  return (
    <Alert
      variant="default"
      className="border-green-600 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
    >
      <AlertTitle className="text-green-700 dark:text-green-300 font-semibold">
        สำเร็จ
      </AlertTitle>
      <AlertDescription className="text-green-600 dark:text-green-400">
        ยืนยันอีเมลสำเร็จ
      </AlertDescription>
    </Alert>
  );
}
