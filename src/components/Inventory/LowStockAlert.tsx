import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import type { LowStockSummary } from '@/api/InventoryApi';

interface LowStockAlertProps {
  summary: LowStockSummary;
}

export function LowStockAlert({ summary }: LowStockAlertProps) {
  return (
    <Card className="border-destructive bg-destructive/5 mx-4 sm:mx-0">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start sm:items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <p className="font-medium text-destructive text-sm sm:text-base">
              Stock bajo
            </p>
            <p className="text-xs sm:text-sm ">
              {summary.rawMaterials.length} materias primas y {summary.bakedProducts.length} productos horneados necesitan reposición
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}