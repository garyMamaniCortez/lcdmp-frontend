import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Edit2, Package, Wheat, Milk, Egg, AlertTriangle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RawMaterial } from '@/types';
import { AdjustStockDialog } from '@/components/Dialogs/AdjustStockDialog';
import { categoryIcons, categoryLabels } from '@/types/consts';

interface DesktopRawMaterialsTableProps {
  materials: RawMaterial[];
  loading: boolean;
  onEdit: (material: RawMaterial) => void;
  onAdjustStock: (id: string, quantity: number) => void;
}

export function DesktopRawMaterialsTable({ 
  materials, 
  loading, 
  onEdit, 
  onAdjustStock 
}: DesktopRawMaterialsTableProps) {
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
      <Card className="overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Material</TableHead>
                <TableHead className="whitespace-nowrap">Categoría</TableHead>
                <TableHead className="whitespace-nowrap">Cantidad</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px]">Stock</TableHead>
                <TableHead className="whitespace-nowrap">Última Actualización</TableHead>
                <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 ">
                    No se encontraron materias primas
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((item) => {
                  const Icon = categoryIcons[item.category] || Package;
                  const stockPercentage = (item.quantity / (item.minStock * 2)) * 100;
                  const isLowStock = item.quantity <= item.minStock;
                  
                  return (
                    <TableRow key={item.id} className={isLowStock ? 'bg-destructive/5' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 " />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{item.name}</p>
                              {isLowStock && (
                                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                              )}
                            </div>
                            <p className="text-sm ">{item.unit}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {categoryLabels[item.category] || item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={isLowStock ? 'text-destructive font-bold' : 'font-medium'}>
                          {item.quantity} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 min-w-[120px]">
                          <Progress 
                            value={Math.min(stockPercentage, 100)} 
                            className={`h-2 ${isLowStock ? '[&>div]:bg-destructive' : ''}`}
                          />
                          <p className="text-xs ">
                            Mín: {item.minStock} {item.unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className=" whitespace-nowrap">
                        {format(item.lastUpdated, 'dd MMM HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAdjustClick(item)}
                            className="h-8"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Agregar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => onEdit(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

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