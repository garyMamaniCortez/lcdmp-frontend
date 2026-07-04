import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Edit2, AlertTriangle, Package, Wheat, Milk, Egg, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RawMaterial } from '@/types';
import { AdjustStockDialog } from '@/components/Dialogs/AdjustStockDialog';
import { categoryIcons, categoryLabels } from '@/types/consts';

interface MobileRawMaterialsListProps {
  materials: RawMaterial[];
  loading: boolean;
  onEdit: (material: RawMaterial) => void;
  onAdjustStock: (id: string, quantity: number) => void;
}

export function MobileRawMaterialsList({ 
  materials, 
  loading, 
  onEdit, 
  onAdjustStock 
}: MobileRawMaterialsListProps) {
  const [selectedItem, setSelectedItem] = useState<RawMaterial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAdjustClick = (item: RawMaterial) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleAdjustConfirm = (quantity: number) => {
    if (selectedItem) {
      onAdjustStock(selectedItem.id, quantity);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 px-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <Card className="mx-4">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No se encontraron materias primas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3 px-4">
        {materials.map((item) => {
          const Icon = categoryIcons[item.category] || Package;
          const stockPercentage = (item.quantity / (item.minStock * 2)) * 100;
          const isLowStock = item.quantity <= item.minStock;
          
          return (
            <Card key={item.id} className={isLowStock ? 'border-destructive' : ''}>
              <CardContent className="p-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {categoryLabels[item.category] || item.category}
                      </Badge>
                    </div>
                  </div>
                  {isLowStock && (
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <span className={isLowStock ? 'text-destructive font-bold' : 'font-medium'}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress 
                      value={Math.min(stockPercentage, 100)} 
                      className={`h-2 ${isLowStock ? '[&>div]:bg-destructive' : ''}`}
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Stock mínimo:</span>
                      <span className="font-medium">{item.minStock} {item.unit}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {format(item.lastUpdated, 'dd MMM HH:mm', { locale: es })}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                        onClick={() => handleAdjustClick(item)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Agregar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8"
                        onClick={() => onEdit(item)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AdjustStockDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleAdjustConfirm}
        itemName={selectedItem?.name || ''}
        itemType="raw"
        currentStock={selectedItem?.quantity || 0}
      />
    </>
  );
}