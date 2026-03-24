import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { MobileCard, useIsMobile } from '@/components/ui/responsive-table';
import { Plus, Search, Edit2, AlertTriangle, Package, Wheat, Milk, Egg, Filter, X } from 'lucide-react';
import { mockRawMaterials, mockBakedProducts } from '@/data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const categoryIcons: Record<string, React.ElementType> = {
  flour: Wheat,
  dairy: Milk,
  eggs: Egg,
  sugar: Package,
  flavoring: Package,
  decoration: Package,
  other: Package,
};

const categoryLabels: Record<string, string> = {
  flour: 'Harinas',
  dairy: 'Lácteos',
  eggs: 'Huevos',
  sugar: 'Azúcares',
  flavoring: 'Saborizantes',
  decoration: 'Decoración',
  other: 'Otros',
};

export default function Inventory() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'raw' | 'baked'>('raw');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRawMaterials = mockRawMaterials.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockRaw = mockRawMaterials.filter(m => m.quantity <= m.minStock);
  const lowStockBaked = mockBakedProducts.filter(p => p.quantity <= p.minStock);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    toast.info('Filtros restablecidos');
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header - Mobile first */}
        <div className="px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Inventario
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Control de materias primas y productos horneados
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => { setDialogType('baked'); setIsDialogOpen(true); }}
              className="w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Horneado
            </Button>
            <Button 
              onClick={() => { setDialogType('raw'); setIsDialogOpen(true); }}
              className="w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Materia Prima
            </Button>
          </div>
        </div>

        {/* Alerts - Mobile first */}
        {(lowStockRaw.length > 0 || lowStockBaked.length > 0) && (
          <Card className="border-destructive bg-destructive/5 mx-4 sm:mx-0">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start sm:items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="font-medium text-destructive text-sm sm:text-base">Stock bajo</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {lowStockRaw.length} materias primas y {lowStockBaked.length} productos horneados necesitan reposición
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="raw" className="px-4 sm:px-0">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
            <TabsTrigger value="raw">Materias Primas</TabsTrigger>
            <TabsTrigger value="baked">Productos Horneados</TabsTrigger>
          </TabsList>

          <TabsContent value="raw" className="space-y-4 mt-4">
            {/* Filters - Mobile first */}
            <Card>
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
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Buscar materias primas..." 
                        className="pl-10 w-full text-sm sm:text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Reset Filters Button */}
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="sm:w-10 h-10 shrink-0"
                      onClick={resetFilters}
                      title="Restablecer filtros"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Active filters indicator */}
                  {(searchTerm || selectedCategory !== 'all') && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>Filtros activos:</span>
                      {searchTerm && (
                        <Badge variant="secondary" className="text-xs">
                          Búsqueda: "{searchTerm}"
                        </Badge>
                      )}
                      {selectedCategory !== 'all' && (
                        <Badge variant="secondary" className="text-xs">
                          Categoría: {categoryLabels[selectedCategory]}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Raw Materials Table / Mobile Cards */}
            {isMobile ? (
              <div className="space-y-3 px-4">
                {filteredRawMaterials.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No se encontraron materias primas</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredRawMaterials.map(item => {
                    const Icon = categoryIcons[item.category] || Package;
                    const stockPercentage = (item.quantity / (item.minStock * 2)) * 100;
                    const isLowStock = item.quantity <= item.minStock;
                    
                    return (
                      <MobileCard key={item.id} className={isLowStock ? 'border-destructive' : ''}>
                        <div className="p-3 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {categoryLabels[item.category]}
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
                            
                            <div className="flex justify-between items-center pt-2 border-t text-xs">
                              <span className="text-muted-foreground">
                                {format(item.lastUpdated, 'dd MMM HH:mm', { locale: es })}
                              </span>
                              <Button variant="ghost" size="sm" className="h-8">
                                <Edit2 className="h-3.5 w-3.5 mr-1" />
                                Editar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </MobileCard>
                    );
                  })
                )}
              </div>
            ) : (
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
                      {filteredRawMaterials.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No se encontraron materias primas
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRawMaterials.map(item => {
                          const Icon = categoryIcons[item.category] || Package;
                          const stockPercentage = (item.quantity / (item.minStock * 2)) * 100;
                          const isLowStock = item.quantity <= item.minStock;
                          
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-3 min-w-[200px]">
                                  <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.unit}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="whitespace-nowrap">
                                  {categoryLabels[item.category]}
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
                                  <p className="text-xs text-muted-foreground">
                                    Mín: {item.minStock} {item.unit}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground whitespace-nowrap">
                                {format(item.lastUpdated, 'dd MMM HH:mm', { locale: es })}
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="baked" className="space-y-4 mt-4">
            {/* Baked Products Grid - Mobile first */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-0">
              {mockBakedProducts.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No hay productos horneados</p>
                  </CardContent>
                </Card>
              ) : (
                mockBakedProducts.map(product => {
                  const isLowStock = product.quantity <= product.minStock;
                  const stockPercentage = (product.quantity / (product.minStock * 2)) * 100;
                  
                  return (
                    <Card key={product.id} className={isLowStock ? 'border-destructive' : ''}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm sm:text-base truncate">{product.name}</h3>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {product.type === 'cake_base' ? 'Base de torta' : 
                               product.type === 'cupcake' ? 'Cupcakes' :
                               product.type === 'cookie' ? 'Galletas' : product.type}
                            </Badge>
                          </div>
                          {isLowStock && (
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive shrink-0 ml-2" />
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-muted-foreground">Cantidad:</span>
                            <span className={isLowStock ? 'text-destructive font-bold' : 'font-medium'}>
                              {product.quantity}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <Progress 
                              value={Math.min(stockPercentage, 100)} 
                              className={`h-1.5 sm:h-2 ${isLowStock ? '[&>div]:bg-destructive' : ''}`}
                            />
                            <p className="text-xs text-muted-foreground">
                              Stock mínimo: {product.minStock}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                          <Button 
                            variant="outline" 
                            className="h-11 sm:h-9 text-sm font-medium touch-manipulation active:scale-[0.98] transition-transform"
                          >
                            <Edit2 className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-1" />
                            Ajustar
                          </Button>
                          <Button 
                            className="h-11 sm:h-9 text-sm font-medium touch-manipulation active:scale-[0.98] transition-transform"
                          >
                            <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-1" />
                            Agregar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Dialog - Mobile optimized */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {dialogType === 'raw' ? 'Nueva Materia Prima' : 'Registrar Productos Horneados'}
              </DialogTitle>
            </DialogHeader>
            {dialogType === 'raw' ? (
              <RawMaterialForm onClose={() => setIsDialogOpen(false)} />
            ) : (
              <BakedProductForm onClose={() => setIsDialogOpen(false)} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

function RawMaterialForm({ onClose }: { onClose: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Materia prima agregada');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1">
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Nombre *</Label>
        <Input placeholder="Nombre del material" required className="text-sm" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Categoría *</Label>
          <Select>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-sm">Unidad *</Label>
          <Select>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Kilogramos (kg)</SelectItem>
              <SelectItem value="L">Litros (L)</SelectItem>
              <SelectItem value="unidad">Unidades</SelectItem>
              <SelectItem value="ml">Mililitros (ml)</SelectItem>
              <SelectItem value="g">Gramos (g)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Cantidad inicial</Label>
          <Input type="number" placeholder="0" className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Stock mínimo</Label>
          <Input type="number" placeholder="0" className="text-sm" />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
          Agregar
        </Button>
      </div>
    </form>
  );
}

function BakedProductForm({ onClose }: { onClose: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Productos horneados registrados');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1">
      <div className="space-y-1.5">
        <Label className="text-sm">Producto *</Label>
        <Select>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Seleccionar producto" />
          </SelectTrigger>
          <SelectContent>
            {mockBakedProducts.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-sm">Cantidad horneada</Label>
        <Input type="number" placeholder="0" className="text-sm" />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
          Registrar
        </Button>
      </div>
    </form>
  );
}