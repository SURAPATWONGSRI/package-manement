import { format } from "date-fns";

interface PackageDetail {
  id: string;
  symbol: string;
  timeframe: string;
}

interface PaymentDetailsProps {
  amount: string;
  packages: string[];
  packageDetails: PackageDetail[];
  startDate: Date;
  endDate: Date;
}

export default function PaymentDetails({
  amount,
  packages,
  packageDetails,
  startDate,
  endDate,
}: PaymentDetailsProps) {
  return (
    <div className="border rounded-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-muted-foreground">จำนวนเงิน</p>
          <p className="text-2xl font-bold text-primary">฿{amount}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">แพ็กเกจ</span>
          <span className="font-medium">
            {packages.length === 3
              ? "ทั้ง 3 แพ็กเกจ"
              : packages.length > 0
              ? `แพ็กเกจ ${packages.join(", ")}`
              : "ไม่ได้เลือกแพ็กเกจ"}
          </span>
        </div>

        {/* Show package details */}
        {packageDetails.map((pkg) => (
          <div key={pkg.id} className="flex justify-between">
            <span className="text-muted-foreground">แพ็กเกจ {pkg.id}</span>
            <span className="font-medium">
              {pkg.symbol} / {pkg.timeframe}
            </span>
          </div>
        ))}

        <div className="flex justify-between">
          <span className="text-muted-foreground">วันเริ่มต้น</span>
          <span className="font-medium">
            {format(startDate, "d MMMM yyyy")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">วันหมดอายุ</span>
          <span className="font-medium">{format(endDate, "d MMMM yyyy")}</span>
        </div>
      </div>
    </div>
  );
}
