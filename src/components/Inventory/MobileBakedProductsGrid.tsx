import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Edit2, Plus, AlertTriangle } from 'lucide-react';
import type { BakedProduct } from '@/types';
import { AdjustStockDialog } from '@/components/Dialogs/AdjustStockDialog';
import { productTypeLabels } from '@/types/consts';

interface MobileBakedProductsGridProps {
  products: BakedProduct[];
  loading: boolean;
  onEdit: (product: BakedProduct) => void;
  onAdjustStock: (id: string, quantity: number) => void;
}

export function MobileBakedProductsGrid({ 
  products, 
  loading, 
  onEdit, 
  onAdjustStock 
}: MobileBakedProductsGridProps) {
  const [selectedItem, setSelectedItem] = useState<BakedProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAdjustClick = (item: BakedProduct) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-0">
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

  if (products.length === 0) {
    return (
      <Card className="mx-4 sm:mx-0">
        <CardContent className="p-8 text-center">
          <p className="">No hay productos horneados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-0">
        {products.map((product) => {
          const isLowStock = product.quantity <= product.minStock;
          const stockPercentage = (product.quantity / (product.minStock * 2)) * 100;
          
          return (
            <Card key={product.id} className={isLowStock ? 'border-destructive' : ''}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm sm:text-base truncate">{product.name}</h3>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {productTypeLabels[product.type] || product.type}
                    </Badge>
                  </div>
                  {isLowStock && (
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive shrink-0 ml-2" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="">Cantidad:</span>
                    <span className={isLowStock ? 'text-destructive font-bold' : 'font-medium'}>
                      {product.quantity}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress 
                      value={Math.min(stockPercentage, 100)} 
                      className={`h-1.5 sm:h-2 ${isLowStock ? '[&>div]:bg-destructive' : ''}`}
                    />
                    <p className="text-xs ">
                      Stock mínimo: {product.minStock}
                    </p>
                  </div>

                  {product.expiresAt && (
                    <p className="text-xs ">
                      Expira: {new Date(product.expiresAt).toLocaleDateString('es')}
                    </p>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-11 sm:h-9 text-sm font-medium touch-manipulation active:scale-[0.98] transition-transform"
                    onClick={() => handleAdjustClick(product)}
                  >
                    <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-1" />
                    Agregar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-11 sm:h-9 text-sm font-medium touch-manipulation active:scale-[0.98] transition-transform"
                    onClick={() => onEdit(product)}
                  >
                    <Edit2 className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-1" />
                    Editar
                  </Button>
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
        itemType="baked"
        currentStock={selectedItem?.quantity || 0}
      />
    </>
  );
}