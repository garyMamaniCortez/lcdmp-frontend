import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MobileCard, MobileCardHeader, useIsMobile } from '@/components/ui/responsive-table';
import { Plus, Calendar, Edit2, Trash2, Eye, Gift, Filter, X, ChevronRight } from 'lucide-react';
import { mockSpecialMenus, mockProducts } from '@/data/mockData';
import { format, isWithinInterval, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function SpecialMenus() {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<typeof mockSpecialMenus[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'past'>('all');

  const activeMenus = mockSpecialMenus.filter(m => m.isActive);
  const upcomingMenus = mockSpecialMenus.filter(m => !m.isActive && isAfter(m.eventDate, new Date()));
  const pastMenus = mockSpecialMenus.filter(m => !m.isActive && !isAfter(m.eventDate, new Date()));

  const filteredMenus = mockSpecialMenus.filter(menu => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return menu.isActive;
    if (filterStatus === 'upcoming') return !menu.isActive && isAfter(menu.eventDate, new Date());
    if (filterStatus === 'past') return !menu.isActive && !isAfter(menu.eventDate, new Date());
    return true;
  });

  const resetFilters = () => {
    setFilterStatus('all');
    toast.info('Filtros restablecidos');
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header - Mobile first */}
        <div className="px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Menús Especiales
            </h1>
            <p className="text-sm sm:text-base ">
              Gestión de menús para eventos especiales
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto justify-center">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Menú
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Nuevo Menú Especial</DialogTitle>
              </DialogHeader>
              <MenuForm onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters - Mobile first */}
        <Card className="mx-4 sm:mx-0">
          <CardContent className="p-3 sm:p-4">
            {/* Mobile filter toggle */}
            <div className="flex sm:hidden items-center justify-between mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </Button>
            </div>

            <div className={`${showFilters ? 'block' : 'hidden'} sm:block space-y-3`}>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 w-full">
                  <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los menús</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="upcoming">Próximos</SelectItem>
                      <SelectItem value="past">Pasados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Filters Button */}
                {filterStatus !== 'all' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={resetFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Active filters indicator */}
              {filterStatus !== 'all' && (
                <div className="flex items-center gap-2 text-xs ">
                  <span>Filtro activo:</span>
                  <Badge variant="secondary" className="text-xs">
                    {filterStatus === 'active' ? 'Activos' : 
                     filterStatus === 'upcoming' ? 'Próximos' : 
                     filterStatus === 'past' ? 'Pasados' : ''}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Menus Section - Solo visible si no hay filtro o filtro es 'all' o 'active' */}
        {(filterStatus === 'all' || filterStatus === 'active') && activeMenus.length > 0 && (
          <div className="space-y-3 sm:space-y-4 px-4 sm:px-0">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Menús Activos
              <Badge variant="default" className="ml-2">{activeMenus.length}</Badge>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {activeMenus.map(menu => (
                <Card key={menu.id} className="border-primary overflow-hidden">
                  <CardHeader className="pb-2 px-4 py-3 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg truncate">{menu.name}</CardTitle>
                        <Badge className="mt-1 text-xs">Activo</Badge>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedMenu(menu)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 sm:px-6">
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 ">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span className="truncate">Evento: {format(menu.eventDate, 'dd MMMM yyyy', { locale: es })}</span>
                      </div>
                      <p className=" text-xs sm:text-sm">
                        Disponible hasta: {format(menu.endDate, 'dd MMMM', { locale: es })}
                      </p>
                      <p className="font-medium text-xs sm:text-sm">{menu.products.length} productos</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All/Filtered Menus */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader className="px-4 py-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">
              {filterStatus === 'all' ? 'Todos los Menús' : 
               filterStatus === 'active' ? 'Todos los Activos' :
               filterStatus === 'upcoming' ? 'Menús Próximos' :
               filterStatus === 'past' ? 'Menús Pasados' : 'Menús'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6">
            {isMobile ? (
              <div className="space-y-3">
                {filteredMenus.length === 0 ? (
                  <p className="text-center  py-8">No hay menús para mostrar</p>
                ) : (
                  filteredMenus.map(menu => (
                    <MobileCard 
                      key={menu.id} 
                      className="active:scale-[0.98] transition-transform cursor-pointer"
                      onClick={() => setSelectedMenu(menu)}
                    >
                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                              menu.isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              <Gift className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-medium text-sm truncate">{menu.name}</h3>
                              <p className="text-xs ">
                                {format(menu.eventDate, 'dd MMM yyyy', { locale: es })}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5  shrink-0" />
                        </div>
                        
                        <div className="flex items-center justify-between pt-1">
                          <Badge variant={menu.isActive ? 'default' : 'secondary'} className="text-xs">
                            {menu.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <span className="text-xs ">
                            {menu.products.length} {menu.products.length === 1 ? 'producto' : 'productos'}
                          </span>
                        </div>
                      </div>
                    </MobileCard>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMenus.length === 0 ? (
                  <p className="text-center  py-8">No hay menús para mostrar</p>
                ) : (
                  filteredMenus.map(menu => (
                    <div 
                      key={menu.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center shrink-0 ${
                          menu.isActive ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
                        }`}>
                          <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm sm:text-base truncate">{menu.name}</h3>
                          <p className="text-xs sm:text-sm ">
                            {format(menu.eventDate, 'dd MMMM yyyy', { locale: es })}
                          </p>
                          <p className="text-xs  sm:hidden mt-1">
                            {menu.products.length} productos
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 ml-13 sm:ml-0">
                        <Badge variant={menu.isActive ? 'default' : 'secondary'} className="text-xs whitespace-nowrap">
                          {menu.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <span className="text-xs  hidden sm:inline">
                          {menu.products.length} prod.
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedMenu(menu)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Detail Dialog - Mobile optimized */}
        <Dialog open={!!selectedMenu} onOpenChange={() => setSelectedMenu(null)}>
          <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{selectedMenu?.name}</DialogTitle>
            </DialogHeader>
            {selectedMenu && (
              <div className="space-y-4 px-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-xs sm:text-sm ">Fecha del evento</p>
                    <p className="font-medium text-sm">{format(selectedMenu.eventDate, 'dd MMMM yyyy', { locale: es })}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm ">Período de disponibilidad</p>
                    <p className="font-medium text-sm">
                      {format(selectedMenu.startDate, 'dd MMM', { locale: es })} - {format(selectedMenu.endDate, 'dd MMM', { locale: es })}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm sm:text-base mb-2">Productos del menú</h4>
                  {selectedMenu.products.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMenu.products.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{item.product.name}</p>
                            {item.isExclusive && (
                              <Badge variant="secondary" className="text-xs mt-1">Exclusivo</Badge>
                            )}
                          </div>
                          <div className="text-right ml-2 shrink-0">
                            {item.specialPrice ? (
                              <>
                                <p className="font-bold text-primary text-sm">Bs. {item.specialPrice}</p>
                                <p className="text-xs  line-through">Bs. {item.product.basePrice}</p>
                              </>
                            ) : (
                              <p className="font-bold text-sm">Bs. {item.product.basePrice}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className=" text-sm">No hay productos asignados</p>
                  )}
                </div>

                <div className="border-t pt-3">
                  <Badge className={selectedMenu.isActive ? 'bg-primary' : ''}>
                    {selectedMenu.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
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
    <form onSubmit={handleSubmit} className="space-y-4 px-1">
      <div className="space-y-1.5">
        <Label className="text-sm">Nombre del menú *</Label>
        <Input placeholder="Ej: Día de la Madre 2024" required className="text-sm" />
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-sm">Fecha del evento *</Label>
        <Input type="date" required className="text-sm" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Fecha inicio</Label>
          <Input type="date" className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Fecha fin</Label>
          <Input type="date" className="text-sm" />
        </div>
      </div>
      
      <p className="text-xs sm:text-sm ">
        Por defecto, el menú estará disponible desde el registro hasta un día después del evento.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
          Crear Menú
        </Button>
      </div>
    </form>
  );
}

// Componente Select simplificado para evitar dependencias externas
function Select({ value, onValueChange, children }: any) {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder: focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  );
}

function SelectTrigger({ children, className }: any) {
  return <div className={className}>{children}</div>;
}

function SelectValue({ placeholder }: any) {
  return <span>{placeholder}</span>;
}

function SelectContent({ children }: any) {
  return <>{children}</>;
}

function SelectItem({ value, children }: any) {
  return <option value={value}>{children}</option>;
}