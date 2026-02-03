import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Edit2, Trash2, Eye, Gift } from 'lucide-react';
import { mockSpecialMenus, mockProducts } from '@/data/mockData';
import { format, isWithinInterval, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function SpecialMenus() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<typeof mockSpecialMenus[0] | null>(null);

  const activeMenus = mockSpecialMenus.filter(m => m.isActive);
  const upcomingMenus = mockSpecialMenus.filter(m => !m.isActive && isAfter(m.eventDate, new Date()));
  const pastMenus = mockSpecialMenus.filter(m => !m.isActive && !isAfter(m.eventDate, new Date()));

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Menús Especiales</h1>
            <p className="text-muted-foreground">Gestión de menús para eventos especiales</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Menú
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuevo Menú Especial</DialogTitle>
              </DialogHeader>
              <MenuForm onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Menus */}
        {activeMenus.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Menús Activos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMenus.map(menu => (
                <Card key={menu.id} className="border-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{menu.name}</CardTitle>
                        <Badge className="mt-1">Activo</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedMenu(menu)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Evento: {format(menu.eventDate, 'dd MMMM yyyy', { locale: es })}</span>
                      </div>
                      <p className="text-muted-foreground">
                        Disponible hasta: {format(menu.endDate, 'dd MMMM', { locale: es })}
                      </p>
                      <p className="font-medium">{menu.products.length} productos</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Menus */}
        <Card>
          <CardHeader>
            <CardTitle>Todos los Menús</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockSpecialMenus.map(menu => (
                <div 
                  key={menu.id} 
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${menu.isActive ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'}`}>
                      <Gift className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{menu.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(menu.eventDate, 'dd MMMM yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={menu.isActive ? 'default' : 'secondary'}>
                      {menu.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedMenu(menu)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu Detail Dialog */}
        <Dialog open={!!selectedMenu} onOpenChange={() => setSelectedMenu(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedMenu?.name}</DialogTitle>
            </DialogHeader>
            {selectedMenu && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Fecha del evento</p>
                    <p className="font-medium">{format(selectedMenu.eventDate, 'dd MMMM yyyy', { locale: es })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Período de disponibilidad</p>
                    <p className="font-medium">
                      {format(selectedMenu.startDate, 'dd MMM', { locale: es })} - {format(selectedMenu.endDate, 'dd MMM', { locale: es })}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Productos del menú</h4>
                  {selectedMenu.products.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMenu.products.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            {item.isExclusive && <Badge variant="secondary" className="text-xs">Exclusivo</Badge>}
                          </div>
                          <div className="text-right">
                            {item.specialPrice ? (
                              <>
                                <p className="font-bold text-primary">Bs. {item.specialPrice}</p>
                                <p className="text-xs text-muted-foreground line-through">Bs. {item.product.basePrice}</p>
                              </>
                            ) : (
                              <p className="font-bold">Bs. {item.product.basePrice}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No hay productos asignados</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

function MenuForm({ onClose }: { onClose: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Menú especial creado');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre del menú *</Label>
        <Input placeholder="Ej: Día de la Madre 2024" required />
      </div>
      <div className="space-y-2">
        <Label>Fecha del evento *</Label>
        <Input type="date" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha inicio</Label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <Label>Fecha fin</Label>
          <Input type="date" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Por defecto, el menú estará disponible desde el registro hasta un día después del evento.
      </p>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Crear Menú</Button>
      </div>
    </form>
  );
}
