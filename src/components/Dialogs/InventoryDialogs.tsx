import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { RawMaterial, BakedProduct, Category } from '@/types';
import { RawMaterialForm } from '@/components/Forms/RawMaterialForm';
import { BakedProductForm } from '@/components/Forms/BakedProductForm';

interface InventoryDialogsProps {
  isOpen: boolean;
  onClose: () => void;
  dialogType: 'raw' | 'baked';
  editingItem: RawMaterial | BakedProduct | null;
  categories: Category[];
  onSaveRaw: (data: any, update: boolean) => void;
  onSaveBaked: (data: any, update: boolean) => void;
}

export function InventoryDialogs({ 
  isOpen, 
  onClose, 
  dialogType, 
  editingItem,
  categories,
  onSaveRaw,
  onSaveBaked
}: InventoryDialogsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {editingItem ? 'Editar' : dialogType === 'raw' ? 'Nueva Materia Prima' : 'Registrar Productos Horneados'}
          </DialogTitle>
        </DialogHeader>
        
        {dialogType === 'raw' ? (
          <RawMaterialForm 
            initialData={editingItem as RawMaterial}
            categories={categories}
            onClose={onClose}
            onSave={onSaveRaw}
          />
        ) : (
          <BakedProductForm 
            initialData={editingItem as BakedProduct}
            onClose={onClose}
            onSave={onSaveBaked}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}