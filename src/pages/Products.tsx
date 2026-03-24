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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MobileCard, MobileCardHeader, MobileCardRow, useIsMobile } from '@/components/ui/responsive-table';
import { Plus, Search, Edit2, Trash2, Cake, Package, Filter, X } from 'lucide-react';
import { mockProducts, mockFlavors } from '@/data/mockData';
import { toast } from 'sonner';

export default function Products() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isFlavorDialogOpen, setIsFlavorDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'cake', label: 'Tortas' },
    { value: 'cupcake', label: 'Cupcakes' },
    { value: 'dessert', label: 'Postres' },
    { value: 'bread', label: 'Pan' },
    { value: 'special', label: 'Especiales' },
  ];

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
              Productos
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Catálogo de productos y sabores
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={isFlavorDialogOpen} onOpenChange={setIsFlavorDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Sabor
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Nuevo Sabor</DialogTitle>
                </DialogHeader>
                <FlavorForm onClose={() => setIsFlavorDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto justify-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Nuevo Producto</DialogTitle>
                </DialogHeader>
                <ProductForm onClose={() => setIsProductDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="products" className="px-4 sm:px-0">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="flavors">Sabores</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4 mt-4">
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
                        placeholder="Buscar productos..." 
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
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
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
                          Categoría: {categories.find(c => c.value === selectedCategory)?.label}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Products Table / Mobile Cards */}
            {isMobile ? (
              <div className="space-y-3">
                {filteredProducts.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No se encontraron productos</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredProducts.map(product => (
                    <MobileCard key={product.id} className="active:scale-[0.98] transition-transform">
                      <MobileCardHeader className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                            <Cake className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                          </div>
                        </div>
                      </MobileCardHeader>
                      
                      <div className="px-3 pb-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Categoría</p>
                            <Badge variant="outline" className="text-xs">
                              {categories.find(c => c.value === product.category)?.label}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Precio</p>
                            <p className="font-medium">Bs. {product.basePrice}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Stock</p>
                            <p className={product.stock <= product.minStock ? 'text-destructive font-medium' : ''}>
                              {product.stock} / {product.minStock}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Ubicación</p>
                            <Badge variant={product.location === 'store' ? 'default' : 'secondary'} className="text-xs">
                              {product.location === 'store' ? 'Tienda' : 'Producción'}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </MobileCard>
                  ))
                )}
              </div>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Producto</TableHead>
                        <TableHead className="whitespace-nowrap">Categoría</TableHead>
                        <TableHead className="whitespace-nowrap">Precio Base</TableHead>
                        <TableHead className="whitespace-nowrap">Ubicación</TableHead>
                        <TableHead className="whitespace-nowrap">Stock</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No se encontraron productos
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map(product => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3 min-w-[200px]">
                                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                  <Cake className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{product.name}</p>
                                  <p className="text-sm text-muted-foreground truncate max-w-xs">
                                    {product.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="whitespace-nowrap">
                                {categories.find(c => c.value === product.category)?.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">Bs. {product.basePrice}</TableCell>
                            <TableCell>
                              <Badge variant={product.location === 'store' ? 'default' : 'secondary'} className="whitespace-nowrap">
                                {product.location === 'store' ? 'Tienda' : 'Producción'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={product.stock <= product.minStock ? 'text-destructive font-medium' : ''}>
                                {product.stock}
                              </span>
                              <span className="text-muted-foreground"> / {product.minStock}</span>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="flavors" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 sm:px-0">
              {/* Cake Flavors */}
              <Card>
                <CardHeader className="px-4 py-3 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Cake className="h-4 w-4 sm:h-5 sm:w-5" />
                    Sabores de Torta
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6">
                  <div className="space-y-2">
                    {mockFlavors.filter(f => f.type === 'cake').map(flavor => (
                      <div key={flavor.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm sm:text-base font-medium">{flavor.name}</span>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Switch checked={flavor.isActive} className="scale-75 sm:scale-100" />
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Filling Flavors */}
              <Card>
                <CardHeader className="px-4 py-3 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    Sabores de Relleno
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6">
                  <div className="space-y-2">
                    {mockFlavors.filter(f => f.type === 'filling').map(flavor => (
                      <div key={flavor.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm sm:text-base font-medium">{flavor.name}</span>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Switch checked={flavor.isActive} className="scale-75 sm:scale-100" />
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function ProductForm({ onClose }: { onClose: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Producto creado exitosamente');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1">
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Nombre *</Label>
        <Input placeholder="Nombre del producto" required className="text-sm" />
      </div>
      
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Descripción</Label>
        <Textarea placeholder="Descripción del producto" className="text-sm" rows={3} />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Categoría *</Label>
          <Select>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cake">Torta</SelectItem>
              <SelectItem value="cupcake">Cupcake</SelectItem>
              <SelectItem value="dessert">Postre</SelectItem>
              <SelectItem value="bread">Pan</SelectItem>
              <SelectItem value="special">Especial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Ubicación</Label>
          <Select>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="store">Tienda</SelectItem>
              <SelectItem value="production">Producción</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Precio base (Bs.)</Label>
          <Input type="number" placeholder="0" className="text-sm" />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Precio por porción (Bs.)</Label>
          <Input type="number" placeholder="0" className="text-sm" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Stock inicial</Label>
          <Input type="number" placeholder="0" className="text-sm" />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Stock mínimo</Label>
          <Input type="number" placeholder="0" className="text-sm" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch id="active" defaultChecked className="scale-75 sm:scale-100" />
        <Label htmlFor="active" className="text-sm">Producto activo</Label>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
          Crear Producto
        </Button>
      </div>
    </form>
  );
}

function FlavorForm({ onClose }: { onClose: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Sabor creado exitosamente');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1">
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Nombre del sabor *</Label>
        <Input placeholder="Ej: Chocolate belga" required className="text-sm" />
      </div>
      
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Tipo *</Label>
        <Select>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cake">Sabor de torta</SelectItem>
            <SelectItem value="filling">Sabor de relleno</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch id="flavor-active" defaultChecked className="scale-75 sm:scale-100" />
        <Label htmlFor="flavor-active" className="text-sm">Sabor activo</Label>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
          Crear Sabor
        </Button>
      </div>
    </form>
  );
}