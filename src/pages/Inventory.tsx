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
import { MobileCard, MobileCardRow, MobileCardHeader, useIsMobile } from '@/components/ui/responsive-table';
import { Plus, Search, Edit2, AlertTriangle, Package, Wheat, Milk, Egg } from 'lucide-react';
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

  const filteredRawMaterials = mockRawMaterials.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockRaw = mockRawMaterials.filter(m => m.quantity <= m.minStock);
  const lowStockBaked = mockBakedProducts.filter(p => p.quantity <= p.minStock);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Inventario</h1>
            <p className="text-muted-foreground">Control de materias primas y productos horneados</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setDialogType('baked'); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Horneado
            </Button>
            <Button onClick={() => { setDialogType('raw'); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Materia Prima
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {(lowStockRaw.length > 0 || lowStockBaked.length > 0) && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Stock bajo</p>
                  <p className="text-sm text-muted-foreground">
                    {lowStockRaw.length} materias primas y {lowStockBaked.length} productos horneados necesitan reposición
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="raw">
          <TabsList>
            <TabsTrigger value="raw">Materias Primas</TabsTrigger>
            <TabsTrigger value="baked">Productos Horneados</TabsTrigger>
          </TabsList>

          <TabsContent value="raw" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar materias primas..." 
                      className="pl-10"
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
                </div>
              </CardContent>
            </Card>

            {/* Raw Materials Table / Mobile Cards */}
            {isMobile ? (
              <div className="space-y-3">
                {filteredRawMaterials.map(item => {
                  const Icon = categoryIcons[item.category] || Package;
                  const stockPercentage = (item.quantity / (item.minStock * 2)) * 100;
                  const isLowStock = item.quantity <= item.minStock;
                  
                  return (
                    <MobileCard key={item.id} className={isLowStock ? 'border-destructive' : ''}>
                      <MobileCardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <Badge variant="outline" className="mt-1">{categoryLabels[item.category]}</Badge>
                          </div>
                        </div>
                        {isLowStock && <AlertTriangle className="h-5 w-5 text-destructive" />}
                      </MobileCardHeader>
                      
                      <div className="space-y-2">
                        <MobileCardRow label="Cantidad">
                          <span className={isLowStock ? 'text-destructive font-bold' : 'font-medium'}>
                            {item.quantity} {item.unit}
                          </span>
                        </MobileCardRow>
                        
                        <div className="space-y-1">
                          <Progress 
                            value={Math.min(stockPercentage, 100)} 
                            className={isLowStock ? '[&>div]:bg-destructive' : ''}
                          />
                          <p className="text-xs text-muted-foreground">
                            Mín: {item.minStock} {item.unit}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-muted-foreground">
                            {format(item.lastUpdated, 'dd MMM HH:mm', { locale: es })}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </MobileCard>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Última Actualización</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRawMaterials.map(item => {
                        const Icon = categoryIcons[item.category] || Package;
                        const stockPercentage = (item.quantity / (item.minStock * 2)) * 100;
                        const isLowStock = item.quantity <= item.minStock;
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">{item.unit}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{categoryLabels[item.category]}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className={isLowStock ? 'text-destructive font-bold' : 'font-medium'}>
                                {item.quantity} {item.unit}
                              </span>
                            </TableCell>
                            <TableCell className="min-w-32">
                              <div className="space-y-1">
                                <Progress 
                                  value={Math.min(stockPercentage, 100)} 
                                  className={isLowStock ? '[&>div]:bg-destructive' : ''}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Mín: {item.minStock} {item.unit}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(item.lastUpdated, 'dd MMM HH:mm', { locale: es })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="baked" className="space-y-4">
            {/* Baked Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockBakedProducts.map(product => {
                const isLowStock = product.quantity <= product.minStock;
                const stockPercentage = (product.quantity / (product.minStock * 2)) * 100;
                
                return (
                  <Card key={product.id} className={isLowStock ? 'border-destructive' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {product.type === 'cake_base' ? 'Base de torta' : 
                             product.type === 'cupcake' ? 'Cupcakes' :
                             product.type === 'cookie' ? 'Galletas' : product.type}
                          </Badge>
                        </div>
                        {isLowStock && (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cantidad:</span>
                          <span className={isLowStock ? 'text-destructive font-bold' : 'font-medium'}>
                            {product.quantity}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(stockPercentage, 100)} 
                          className={isLowStock ? '[&>div]:bg-destructive' : ''}
                        />
                        <p className="text-xs text-muted-foreground">
                          Stock mínimo: {product.minStock}
                        </p>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit2 className="h-4 w-4 mr-1" />
                          Ajustar
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre *</Label>
        <Input placeholder="Nombre del material" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoría *</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Unidad *</Label>
          <Select>
            <SelectTrigger>
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cantidad inicial</Label>
          <Input type="number" placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label>Stock mínimo</Label>
          <Input type="number" placeholder="0" />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Agregar</Button>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Producto *</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar producto" />
          </SelectTrigger>
          <SelectContent>
            {mockBakedProducts.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Cantidad horneada</Label>
        <Input type="number" placeholder="0" />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Registrar</Button>
      </div>
    </form>
  );
}
