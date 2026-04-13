import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MobileCard, MobileCardHeader, MobileCardRow, useIsMobile } from '@/components/ui/responsive-table';
import { Plus, Search, Edit2, Trash2, Cake, Package, Filter, X, PlusCircle, Loader2 } from 'lucide-react';
import { mockProducts, mockFlavors } from '@/data/mockData';
import { toast } from 'sonner';
import { Flavor, Product } from '@/types';


export default function Products() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isFlavorDialogOpen, setIsFlavorDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [submitting, setSubmitting] = useState(false);
  
  // Estado para sabores
  const [flavors, setFlavors] = useState<Flavor[]>(mockFlavors);
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);
  const [deletingFlavor, setDeletingFlavor] = useState<Flavor | null>(null);
  const [isFlavorDeleteDialogOpen, setIsFlavorDeleteDialogOpen] = useState(false);

  const filteredProducts = products.filter(product => {
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

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsProductDialogOpen(true);
  }

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteProduct = () => {
    if (!deletingProduct) return;

    const newProducts = products.filter(p => p.id !== deletingProduct.id);
    setProducts(newProducts);
    setIsDeleteDialogOpen(false);
    toast.success(`Producto "${deletingProduct.name}" eliminado exitosamente`);
  }

  const handleCancelDeleteProduct = () => {
    setDeletingProduct(null);
    setIsDeleteDialogOpen(false);
  }

  const handleAddStock = (product: Product) => {
    setStockProduct(product);
  };

  const handleCloseProductDialog = () => {
    setIsProductDialogOpen(false);
    setEditingProduct(null);
  };

  const handleCloseStockDialog = () => {
    setStockProduct(null);
  };

  const handleProductSaved = (savedProduct: Product) => {
    let newProducts: Product[];
    if (editingProduct) {
      newProducts = products.map(p => p.id === savedProduct.id ? savedProduct : p);
      toast.success(`Producto "${savedProduct.name}" actualizado exitosamente`);
    } else {
      newProducts = [...products, savedProduct];
      toast.success(`Producto "${savedProduct.name}" creado exitosamente`);
    }
    setProducts(newProducts);
    handleCloseProductDialog();
  };

  const handleStockAdded = (productId: string, quantity: number) => {
    const newProducts = products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: p.stock + quantity };
      }
      return p;
    });
    setProducts(newProducts);
    handleCloseStockDialog();
  };

  const handleAddFlavor = (newFlavor: Omit<Flavor, 'id'>) => {
    const flavor: Flavor = {
      ...newFlavor,
      id: Date.now().toString(),
    };
    setFlavors([...flavors, flavor]);
    toast.success(`Sabor "${flavor.name}" creado exitosamente`);
  };

  const handleToggleFlavorStatus = (flavorId: string) => {
    setFlavors(flavors.map(flavor => 
      flavor.id === flavorId 
        ? { ...flavor, isActive: !flavor.isActive }
        : flavor
    ));
    const flavor = flavors.find(f => f.id === flavorId);
    const newStatus = !flavor?.isActive;
    toast.success(`Sabor "${flavor?.name}" ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
  };

  const handleDeleteFlavor = (flavor: Flavor) => {
    setDeletingFlavor(flavor);
    setIsFlavorDeleteDialogOpen(true);
  };

  const handleConfirmDeleteFlavor = () => {
    if (!deletingFlavor) return;
    
    setFlavors(flavors.filter(f => f.id !== deletingFlavor.id));
    setIsFlavorDeleteDialogOpen(false);
    toast.success(`Sabor "${deletingFlavor.name}" eliminado exitosamente`);
    setDeletingFlavor(null);
  };

  const handleCancelDeleteFlavor = () => {
    setDeletingFlavor(null);
    setIsFlavorDeleteDialogOpen(false);
  };

  const handleEditFlavor = (flavor: Flavor) => {
    setEditingFlavor(flavor);
    setIsFlavorDialogOpen(true);
  };

  const handleUpdateFlavor = (updatedFlavor: Flavor) => {
    setFlavors(flavors.map(f => f.id === updatedFlavor.id ? updatedFlavor : f));
    toast.success(`Sabor "${updatedFlavor.name}" actualizado exitosamente`);
    setEditingFlavor(null);
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
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
            <Dialog open={isFlavorDialogOpen} onOpenChange={(open) => {
              if (!open) setEditingFlavor(null);
              setIsFlavorDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Sabor
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    {editingFlavor ? 'Editar Sabor' : 'Nuevo Sabor'}
                  </DialogTitle>
                </DialogHeader>
                <FlavorForm 
                  onClose={() => {
                    setIsFlavorDialogOpen(false);
                    setEditingFlavor(null);
                  }} 
                  onSave={editingFlavor ? handleUpdateFlavor : handleAddFlavor}
                  initialFlavor={editingFlavor}
                />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
              if (!open) handleCloseProductDialog();
              setIsProductDialogOpen(open);
            }}>
              <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </DialogTitle>
                </DialogHeader>
                <ProductForm 
                  onClose={handleCloseProductDialog} 
                  onSave={handleProductSaved}
                  initialProduct={editingProduct}
                />
              </DialogContent>
            </Dialog>

            <Button 
              className="w-full sm:w-auto justify-center"
              onClick={handleCreateProduct}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Eliminar producto</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              {deletingProduct && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <p className="font-medium">{deletingProduct.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelDeleteProduct}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleConfirmDeleteProduct}
                      disabled={submitting}
                    >
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Producto
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isFlavorDeleteDialogOpen} onOpenChange={setIsFlavorDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Eliminar sabor</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar este sabor? Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              {deletingFlavor && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">{deletingFlavor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Tipo: {deletingFlavor.type === 'cake' ? 'Sabor de torta' : 'Sabor de relleno'}
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleCancelDeleteFlavor}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleConfirmDeleteFlavor}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Sabor
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Stock Dialog */}
        <Dialog open={stockProduct !== null} onOpenChange={handleCloseStockDialog}>
          <DialogContent className="w-[95vw] sm:w-full max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Agregar Stock - {stockProduct?.name}
              </DialogTitle>
            </DialogHeader>
            {stockProduct && (
              <AddStockForm 
                product={stockProduct} 
                onClose={handleCloseStockDialog}
                onAddStock={handleStockAdded}
              />
            )}
          </DialogContent>
        </Dialog>

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
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleAddStock(product)}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleDeleteProduct(product)}
                            >
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
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleAddStock(product)}
                                title="Agregar stock"
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleEditProduct(product)}
                                title="Editar"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleDeleteProduct(product)}
                                title="Eliminar"
                              >
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
                    {flavors.filter(f => f.type === 'cake').map(flavor => (
                      <div key={flavor.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <span className={`text-sm sm:text-base font-medium ${!flavor.isActive ? 'text-muted-foreground line-through' : ''}`}>
                          {flavor.name}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Switch 
                            checked={flavor.isActive} 
                            onCheckedChange={() => handleToggleFlavorStatus(flavor.id)}
                            className="scale-75 sm:scale-100" 
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleEditFlavor(flavor)}
                          >
                            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleDeleteFlavor(flavor)}
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {flavors.filter(f => f.type === 'cake').length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No hay sabores de torta registrados
                      </div>
                    )}
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
                    {flavors.filter(f => f.type === 'filling').map(flavor => (
                      <div key={flavor.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <span className={`text-sm sm:text-base font-medium ${!flavor.isActive ? 'text-muted-foreground line-through' : ''}`}>
                          {flavor.name}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Switch 
                            checked={flavor.isActive} 
                            onCheckedChange={() => handleToggleFlavorStatus(flavor.id)}
                            className="scale-75 sm:scale-100" 
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleEditFlavor(flavor)}
                          >
                            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleDeleteFlavor(flavor)}
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {flavors.filter(f => f.type === 'filling').length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No hay sabores de relleno registrados
                      </div>
                    )}
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

function AddStockForm({ product, onClose, onAddStock }: { 
  product: Product; 
  onClose: () => void;
  onAddStock: (productId: string, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    onAddStock(product.id, quantity);
    toast.success(`Se agregaron ${quantity} unidades al stock de "${product.name}"`);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1">
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Stock actual</Label>
        <p className="text-lg font-semibold">{product.stock} unidades</p>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Cantidad a agregar *</Label>
        <Input 
          type="number" 
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          placeholder="Cantidad"
          required 
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Stock después de agregar</Label>
        <p className="text-lg font-semibold text-primary">{product.stock + quantity} unidades</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
          Agregar Stock
        </Button>
      </div>
    </form>
  );
}

function ProductForm({ onClose, onSave, initialProduct }: { 
  onClose: () => void; 
  onSave: (product: Product) => void;
  initialProduct?: Product | null;
}) {
  const isEditing = !!initialProduct;
  
  const [formData, setFormData] = useState({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    category: initialProduct?.category || 'cake',
    location: initialProduct?.location || 'store',
    basePrice: initialProduct?.basePrice || 0,
    pricePerPortion: initialProduct?.pricePerPortion || 0,
    stock: initialProduct?.stock || 0,
    minStock: initialProduct?.minStock || 1,
    isActive: initialProduct?.isActive ?? true,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre del producto es requerido');
      return;
    }
    
    if (formData.basePrice <= 0) {
      toast.error('El precio base debe ser mayor a 0');
      return;
    }

    const product: Product = {
      id: initialProduct?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      basePrice: formData.basePrice,
      category: formData.category as any,
      portionSize: 10,
      pricePerPortion: formData.pricePerPortion,
      isActive: formData.isActive,
      location: formData.location as any,
      stock: formData.stock,
      minStock: formData.minStock,
    };
    
    onSave(product);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1">
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Nombre *</Label>
        <Input 
          placeholder="Nombre del producto" 
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required 
          className="text-sm" 
        />
      </div>
      
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Descripción</Label>
        <Textarea 
          placeholder="Descripción del producto" 
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="text-sm" 
          rows={3} 
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Categoría *</Label>
          <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
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
          <Select value={formData.location} onValueChange={(v) => handleChange('location', v)}>
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
          <Input 
            type="number" 
            placeholder="0" 
            value={formData.basePrice || ''}
            onChange={(e) => handleChange('basePrice', parseFloat(e.target.value) || 0)}
            className="text-sm" 
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Precio por porción (Bs.)</Label>
          <Input 
            type="number" 
            placeholder="0" 
            value={formData.pricePerPortion || ''}
            onChange={(e) => handleChange('pricePerPortion', parseFloat(e.target.value) || 0)}
            className="text-sm" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Stock inicial</Label>
          <Input 
            type="number" 
            placeholder="0" 
            value={formData.stock || ''}
            onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
            className="text-sm" 
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Stock mínimo</Label>
          <Input 
            type="number" 
            placeholder="0" 
            value={formData.minStock || ''}
            onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
            className="text-sm" 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch 
          id="active" 
          checked={formData.isActive}
          onCheckedChange={(v) => handleChange('isActive', v)}
          className="scale-75 sm:scale-100" 
        />
        <Label htmlFor="active" className="text-sm">Producto activo</Label>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
          {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
}

function FlavorForm({ onClose, onSave, initialFlavor }: { 
  onClose: () => void; 
  onSave: (flavor: Flavor) => void;
  initialFlavor?: Flavor | null;
}) {
  const isEditing = !!initialFlavor;
  const [name, setName] = useState(initialFlavor?.name || '');
  const [type, setType] = useState<'cake' | 'filling'>(initialFlavor?.type || 'cake');
  const [isActive, setIsActive] = useState(initialFlavor?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('El nombre del sabor es requerido');
      return;
    }

    const flavorData = {
      name: name.trim(),
      type,
      isActive,
    };

    if (isEditing && initialFlavor) {
      onSave({ ...flavorData, id: initialFlavor.id });
    } else {
      onSave(flavorData as any);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1">
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Nombre del sabor *</Label>
        <Input 
          placeholder="Ej: Chocolate belga" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
          className="text-sm" 
        />
      </div>
      
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-sm">Tipo *</Label>
        <Select value={type} onValueChange={(v) => setType(v as 'cake' | 'filling')}>
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
        <Switch 
          id="flavor-active" 
          checked={isActive}
          onCheckedChange={setIsActive}
          className="scale-75 sm:scale-100" 
        />
        <Label htmlFor="flavor-active" className="text-sm">Sabor activo</Label>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
          {isEditing ? 'Actualizar Sabor' : 'Crear Sabor'}
        </Button>
      </div>
    </form>
  );
}