import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MobileCard, MobileCardHeader, useIsMobile } from '@/components/ui/responsive-table';
import { Plus, Search, Eye, RefreshCw, X, Filter, Pencil, Trash, Edit, Trash2 } from 'lucide-react';
import { mockFlavors, mockOrders, mockProducts } from '@/data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CustomCake, Order, OrderStatus } from '@/types';
import { toast } from 'sonner';
import { statusConfig } from '@/types/consts';

const orders: Order[] = mockOrders;

export default function Orders() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getOrderPriority = (order: typeof orders[0]) => {
    const hoursUntilPickup = (order.pickupDate.getTime() - Date.now()) / (1000 * 60 * 60);
    const totalPortions = order.customCakes.reduce((sum, cake) => sum + cake.portions, 0);
    return hoursUntilPickup - (totalPortions / 10);
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => getOrderPriority(a) - getOrderPriority(b));

  const stats = Object.entries(statusConfig).map(([status, config]) => ({
    status,
    ...config,
    count: orders.filter(o => o.status === status).length
  }));

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header - Mobile first */}
        <div className="px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Pedidos
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gestión de pedidos de tortas y combos
            </p>
          </div>
          
          <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Nuevo Pedido</DialogTitle>
              </DialogHeader>
              <NewOrderForm onClose={() => setIsNewOrderOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards - Mobile: 2 columnas, Tablet/Desktop: 4 columnas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 px-4 sm:px-0">
          {stats.slice(0, 4).map(({ status, label, color, icon: Icon, count }) => (
            <Card 
              key={status} 
              className={`cursor-pointer hover:shadow-md transition-shadow active:scale-95 sm:active:scale-100 ${
                selectedStatus === status ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedStatus(status === selectedStatus ? 'all' : status)}
            >
              <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-lg ${color} flex-shrink-0`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{count}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters - Mobile: collapsible */}
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

            <div className={`${showFilters ? 'block' : 'hidden'} sm:block space-y-3 sm:space-y-0`}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nombre o teléfono..." 
                    className="pl-10 w-full text-sm sm:text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {Object.entries(statusConfig).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Reset Filters Button */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="sm:w-10 h-10 shrink-0"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('all');
                    toast.info('Filtros restablecidos');
                  }}
                  title="Restablecer filtros"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Active filters indicator (opcional) */}
              {(searchTerm || selectedStatus !== 'all') && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 sm:hidden">
                  <span>Filtros activos:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Búsqueda: "{searchTerm}"
                    </Badge>
                  )}
                  {selectedStatus !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Estado: {statusConfig[selectedStatus as OrderStatus]?.label}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders Table / Mobile Cards */}
        {isMobile ? (
          <div className="space-y-3 px-4">
            {sortedOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No se encontraron pedidos</p>
                </CardContent>
              </Card>
            ) : (
              sortedOrders.map(order => {
                const config = statusConfig[order.status];
                const Icon = config.icon;
                return (
                  <MobileCard 
                    key={order.id} 
                    className="active:scale-[0.98] transition-transform"
                  >
                    <MobileCardHeader className="px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-primary text-sm">#{order.id}</span>
                        <Badge className={`${config.color} text-xs px-2 py-0.5`}>
                          <Icon className="h-3 w-3 mr-1 inline" />
                          {config.label}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 shrink-0"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleEditOrder(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </MobileCardHeader>
                    
                    <div className="space-y-2 px-3 pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-medium text-sm">{format(order.pickupDate, 'dd MMM', { locale: es })}</p>
                          <p className="text-xs text-muted-foreground">{order.pickupTime}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs bg-muted/50 p-2 rounded space-y-1">
                        {order.customCakes.length > 0 && (
                          <p className="truncate">
                            {order.customCakes.map(c => `${c.portions}p ${c.cakeFlavor}`).join(', ')}
                          </p>
                        )}
                        {order.sweetTableCombo && (
                          <p className="text-muted-foreground truncate">
                            Mesa dulce ({order.sweetTableCombo.totalQuantity} postres)
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Adelanto</p>
                          <p className="font-medium">Bs. {order.deposit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-bold text-primary">Bs. {order.total}</p>
                        </div>
                      </div>
                    </div>
                  </MobileCard>
                );
              })
            )}
          </div>
        ) : (
          <Card className="mx-4 sm:mx-0 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Pedido</TableHead>
                    <TableHead className="whitespace-nowrap">Cliente</TableHead>
                    <TableHead className="whitespace-nowrap">Fecha Entrega</TableHead>
                    <TableHead className="whitespace-nowrap">Descripción</TableHead>
                    <TableHead className="whitespace-nowrap">Total</TableHead>
                    <TableHead className="whitespace-nowrap">Estado</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron pedidos
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedOrders.map(order => {
                      const config = statusConfig[order.status];
                      const Icon = config.icon;
                      return (
                        <TableRow key={order.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{format(order.pickupDate, 'dd MMM', { locale: es })}</p>
                              <p className="text-sm text-muted-foreground">{order.pickupTime}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {order.customCakes.length > 0 && (
                                <p className="text-sm">
                                  {order.customCakes.map(c => `${c.portions}p ${c.cakeFlavor}`).join(', ')}
                                </p>
                              )}
                              {order.sweetTableCombo && (
                                <p className="text-sm text-muted-foreground">
                                  Mesa dulce ({order.sweetTableCombo.totalQuantity} postres)
                                </p>
                              )}
                              {order.items.length > 0 && (
                                <p className="text-sm">
                                  {order.items.map((item,i) => `${item.quantity} ${item.product.name}`).join(', ')}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-bold">Bs. {order.total}</p>
                            <p className="text-sm text-muted-foreground">
                              Adelanto: Bs. {order.deposit}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${config.color} whitespace-nowrap`}>
                              <Icon className="h-3 w-3 mr-1 inline" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setSelectedOrder(order)}
                                className="h-8 w-8"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditOrder(order)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Editar
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
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
        )}

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Pedido #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && <OrderDetail order={selectedOrder} />}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

function NewOrderForm({ onClose }: { onClose: () => void }) {
  const [orderType, setOrderType] = useState<'cake' | 'products' | 'sweet_table' | 'mixed'>('cake');
  const [selectedOptions, setSelectedOptions] = useState({
    hasCake: true,
    hasProducts: false,
    hasSweetTable: false
  });
  
  const [customCakes, setCustomCakes] = useState<Partial<CustomCake>[]>([
  ]);
  
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    productId: string;
    quantity: number;
    notes?: string;
  }>>([]);
  
  const cakeFlavors = mockFlavors.filter(f => f.type === 'cake' && f.isActive);
  const fillingFlavors = mockFlavors.filter(f => f.type === 'filling' && f.isActive);
  const catalogProducts = mockProducts.filter(p => p.isActive && p.location === 'store');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Pedido creado exitosamente');
    onClose();
  };

  const addCake = () => {
    setCustomCakes([...customCakes, { portions: 15, quantity: 1 }]);
  };

  const removeCake = (index: number) => {
    setCustomCakes(customCakes.filter((_, i) => i !== index));
  };

  const updateCake = (index: number, field: keyof CustomCake, value: any) => {
    const updated = [...customCakes];
    updated[index] = { ...updated[index], [field]: value };
    setCustomCakes(updated);
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: 1 }]);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Nombre del cliente *</Label>
          <Input placeholder="Nombre completo" required className="text-sm" />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Teléfono *</Label>
          <Input placeholder="Número de teléfono" required className="text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Fecha de entrega *</Label>
          <Input type="date" required className="text-sm" />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Hora de entrega *</Label>
          <Input type="time" required className="text-sm" />
        </div>
      </div>

      <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 sm:justify-self-center justify-self-start">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <Input
                  type="checkbox"
                  checked={selectedOptions.hasCake}
                  onChange={(e) => {
                    setSelectedOptions({...selectedOptions, hasCake: e.target.checked});
                    if (!e.target.checked && customCakes.length > 0) {
                      setCustomCakes([]);
                    }
                  }}
                  className="sr-only peer"
                  id="hasCake"
                />
                <div className="w-5 h-5 border-2 rounded-md border-muted-foreground/30 peer-checked:border-primary peer-checked:bg-primary transition-all duration-200 flex items-center justify-center group-hover:border-primary/50">
                  <svg 
                    className="w-3 h-3 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <label htmlFor="hasCake" className="text-sm font-medium cursor-pointer select-none group-hover:text-primary transition-colors">
                Torta personalizada
              </label>
            </div>
          </label>
          
          <label className="flex items-center gap-2 sm:justify-self-center justify-self-start">
            <div className="relative flex items-center">
                <Input 
                  type="checkbox" 
                  checked={selectedOptions.hasProducts}
                  onChange={(e) => {
                    setSelectedOptions({...selectedOptions, hasProducts: e.target.checked});
                    if (!e.target.checked) {
                      setSelectedProducts([]);
                    }
                  }}
                  className="sr-only peer"
                  id='hasItems'
                />
                <div className="w-5 h-5 border-2 rounded-md border-muted-foreground/30 peer-checked:border-primary peer-checked:bg-primary transition-all duration-200 flex items-center justify-center group-hover:border-primary/50">
                  <svg 
                    className="w-3 h-3 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            <span className="text-sm">Productos del catálogo</span>
          </label>
          
          <label className="flex items-center gap-2 sm:justify-self-center justify-self-start">
            <div className="relative flex items-center">
                <Input 
                  type="checkbox" 
                    checked={selectedOptions.hasSweetTable}
                    onChange={(e) => {
                      setSelectedOptions({...selectedOptions, hasSweetTable: e.target.checked});
                    }}
                  className="sr-only peer"
                  id='hasItems'
                />
                <div className="w-5 h-5 border-2 rounded-md border-muted-foreground/30 peer-checked:border-primary peer-checked:bg-primary transition-all duration-200 flex items-center justify-center group-hover:border-primary/50">
                  <svg 
                    className="w-3 h-3 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            <span className="text-sm">Mesa dulce</span>
          </label>
        </div>
      </div>

      {selectedOptions.hasCake && (
        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-base">Tortas Personalizadas</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addCake}
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar Torta
            </Button>
          </div>
          
          {customCakes.map((cake, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-3 relative">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Torta #{index + 1}</span>
                {customCakes.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeCake(index)}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Cantidad</Label>
                  <Input 
                    type="number" 
                    min="1"
                    value={cake.quantity || 1}
                    onChange={(e) => updateCake(index, 'quantity', parseInt(e.target.value))}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-sm">Porciones por torta</Label>
                  <Select 
                    value={cake.portions?.toString()}
                    onValueChange={(v) => updateCake(index, 'portions', parseInt(v))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 15, 20, 25, 30, 40, 50].map(p => (
                        <SelectItem key={p} value={p.toString()}>{p} porciones</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Forma (opcional)</Label>
                  <Select 
                    value={cake.shape}
                    onValueChange={(v) => updateCake(index, 'shape', v)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round">Redonda</SelectItem>
                      <SelectItem value="square">Cuadrada</SelectItem>
                      <SelectItem value="rectangle">Rectangular</SelectItem>
                      <SelectItem value="heart">Corazón</SelectItem>
                      <SelectItem value="two-tier">Dos pisos</SelectItem>
                      <SelectItem value="three-tier">Tres pisos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Sabor de torta</Label>
                  <Select 
                    value={cake.cakeFlavor}
                    onValueChange={(v) => updateCake(index, 'cakeFlavor', v)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {cakeFlavors.map(f => (
                        <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Sabor de relleno</Label>
                  <Select>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {fillingFlavors.map(f => (
                        <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Descripción del diseño</Label>
                <Textarea 
                  placeholder="Describe el diseño deseado..." 
                  className="text-sm" 
                  rows={2}
                  value={cake.design || ''}
                  onChange={(e) => updateCake(index, 'design', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Dedicatoria (opcional)</Label>
                <Input 
                  placeholder="Texto para la torta" 
                  className="text-sm"
                  value={cake.dedication || ''}
                  onChange={(e) => updateCake(index, 'dedication', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Precio (Bs.)</Label>
                <Input 
                  type="number"
                  placeholder="0" 
                  className="text-sm"
                  value={cake.price || ''}
                  onChange={(e) => updateCake(index, 'price', parseFloat(e.target.value))}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOptions.hasProducts && (
        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-base">Productos del Catálogo</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addProduct}
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar Producto
            </Button>
          </div>
          
          {selectedProducts.map((product, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Producto #{index + 1}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeProduct(index)}
                  className="text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Producto</Label>
                  <Select 
                    value={product.productId}
                    onValueChange={(v) => {
                      const updated = [...selectedProducts];
                      updated[index].productId = v;
                      setSelectedProducts(updated);
                    }}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogProducts.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} - Bs. {p.basePrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Cantidad</Label>
                  <Input 
                    type="number" 
                    min="1"
                    value={product.quantity}
                    onChange={(e) => {
                      const updated = [...selectedProducts];
                      updated[index].quantity = parseInt(e.target.value);
                      setSelectedProducts(updated);
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-sm">Notas (opcional)</Label>
                <Input 
                  placeholder="Ej: Sin gluten, decoración especial..." 
                  className="text-sm"
                  value={product.notes || ''}
                  onChange={(e) => {
                    const updated = [...selectedProducts];
                    updated[index].notes = e.target.value;
                    setSelectedProducts(updated);
                  }}
                />
              </div>
            </div>
          ))}
          
          {selectedProducts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
            </p>
          )}
        </div>
      )}

      {selectedOptions.hasSweetTable && (
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">Mesa Dulce</h3>
          
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Combo predefinido</Label>
              <Select>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Seleccionar combo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 postres - Bs. 400</SelectItem>
                  <SelectItem value="100">100 postres - Bs. 750</SelectItem>
                  <SelectItem value="custom">Cantidad personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm">Cantidad personalizada</Label>
              <Input 
                type="number" 
                placeholder="Ej: 75" 
                className="text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm">Precio total mesa dulce (Bs.)</Label>
              <Input 
                type="number" 
                placeholder="0" 
                className="text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm">Detalles adicionales</Label>
              <Textarea 
                placeholder="Tipos de postres, presentación, colores..." 
                className="text-sm" 
                rows={2}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delivery y Pago - Sin cambios */}
      <div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Dirección de envío (opcional)</Label>
          <Input placeholder="Dirección o link de ubicación" className="text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Costo de envío</Label>
            <Input type="number" placeholder="0" className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Garantía (opcional)</Label>
            <Input placeholder="Descripción de garantía" className="text-sm" />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Total</Label>
            <Input type="number" placeholder="0" className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Adelanto</Label>
            <Input type="number" placeholder="0" className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Método de pago</Label>
            <Select>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="qr">QR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Notas adicionales</Label>
        <Textarea placeholder="Observaciones del pedido..." className="text-sm" rows={3} />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
          Crear Pedido
        </Button>
      </div>
    </form>
  );
}

function OrderDetail({ order }: { order: typeof orders[0] }) {
  return (
    <div className="space-y-3 sm:space-y-4 px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">Cliente</p>
          <p className="font-medium text-sm sm:text-base">{order.customerName}</p>
          <p className="text-xs sm:text-sm">{order.customerPhone}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">Entrega</p>
          <p className="font-medium text-sm sm:text-base">
            {format(order.pickupDate, "dd 'de' MMMM", { locale: es })}
          </p>
          <p className="text-xs sm:text-sm">{order.pickupTime}</p>
        </div>
      </div>

      {/* Tortas personalizadas */}
      {order.customCakes.length > 0 && (
        <div className="border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm sm:text-base mb-2">Tortas personalizadas</h4>
          {order.customCakes.map((cake, i) => (
            <div key={i} className="bg-muted/50 p-2 sm:p-3 rounded-lg mb-2 text-sm">
              <div className="flex justify-between">
                <p className="font-medium">
                  {cake.quantity > 1 ? `${cake.quantity} x ` : ''}
                  {cake.portions} porciones - {cake.cakeFlavor}
                </p>
                <p className="font-medium">Bs. {cake.price}</p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Relleno: {cake.fillingFlavors.join(', ')}
              </p>
              {cake.shape && <p className="text-xs sm:text-sm">Forma: {cake.shape}</p>}
              {cake.design && <p className="text-xs sm:text-sm mt-1">{cake.design}</p>}
              {cake.dedication && <p className="text-xs sm:text-sm">{cake.dedication}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Productos del catálogo */}
      {order.items.length > 0 && (
        <div className="border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm sm:text-base mb-2">📦 Productos del catálogo</h4>
          {order.items.map((item, i) => (
            <div key={i} className="bg-muted/50 p-2 sm:p-3 rounded-lg mb-2 text-sm">
              <div className="flex justify-between">
                <p className="font-medium">{item.quantity} x {item.product.name}</p>
                <p className="font-medium">Bs. {item.price * item.quantity}</p>
              </div>
              {item.notes && (
                <p className="text-xs text-muted-foreground mt-1">📝 {item.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mesa Dulce */}
      {order.sweetTableCombo && (
        <div className="border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm sm:text-base mb-2">🍰 Mesa Dulce</h4>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm">{order.sweetTableCombo.totalQuantity} postres</p>
            <p className="font-medium mt-1">Total: Bs. {order.sweetTableCombo.price}</p>
          </div>
        </div>
      )}

      {order.guarantee && (
        <div className="border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm sm:text-base mb-2">Garantía</h4>
          <p className="text-sm">Bs. {order.guarantee.amount} - {order.guarantee.items}</p>
        </div>
      )}

      {order.deliveryAddress && (
        <div className="border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm sm:text-base mb-2">Dirección de envío</h4>
          <p className="text-sm">{order.deliveryAddress}</p>
          {order.deliveryCost > 0 && (
            <p className="text-sm text-muted-foreground mt-1">Costo envío: Bs. {order.deliveryCost}</p>
          )}
        </div>
      )}

      <div className="border-t pt-3 sm:pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-primary">Bs. {order.total}</p>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <p className="text-xs sm:text-sm text-muted-foreground">Adelanto pagado</p>
          <p className="text-base sm:text-lg font-medium">Bs. {order.deposit}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Saldo: Bs. {order.total - order.deposit}
          </p>
        </div>
      </div>

      <div className="border-t pt-3 flex justify-end">
        <Badge className={statusConfig[order.status].color}>
          {statusConfig[order.status].label}
        </Badge>
      </div>
    </div>
  );
}
