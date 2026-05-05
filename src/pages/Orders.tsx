import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
import { Plus, Search, Eye, RefreshCw, X, Filter, Pencil, Trash2, Edit, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreateOrderData, CustomCake, Order, OrderStatus, UpdateOrderData, OrderItem, OrderCombo, Flavor, Product, OrderFilters } from '@/types';
import { toast } from 'sonner';
import { statusConfig } from '@/types/consts';
import { IOrdersApi, defaultOrdersApi } from '@/api/OrdersApi';
import { useDebounce } from '@/hooks/useDebounce';
import { OrderType } from '../types/index';

interface OrdersProps {
  ordersApi?: IOrdersApi;
}

const getOrderType = (orderType: OrderType) => {
  let type;
  switch (orderType.toLowerCase()) {
    case "cake":
      type = "Torta";
      break;
    case "products":
      type = "Productos";
      break;
    case "sweet_table":
      type = "Mesa Dulce";
      break;
    case "mixed":
      type = "Varios";
      break;
    default:
      type = "";
      break
  }
  return type;
}

export default function Orders({ ordersApi = defaultOrdersApi }: OrdersProps) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fillings, setFillings] = useState<Flavor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Array<{ status: string; label: string; color: string; icon: any; count: number }>>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isPhoneSearch = useMemo(() => {
    return /^\d+$/.test(debouncedSearchTerm);
  }, [debouncedSearchTerm]);



  const loadOrders = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      
      const filters: OrderFilters = {};
      
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus as OrderStatus;
      }
      
      if (debouncedSearchTerm) {
        if (isPhoneSearch) {
          filters.customerPhone = debouncedSearchTerm;
        } else {
          filters.customerName = debouncedSearchTerm;
        }
      }
      
      const [ordersData, flavors, productsResponse] = await Promise.all([
        ordersApi.getOrders(filters, abortControllerRef.current.signal),
        ordersApi.getFlavors(),
        ordersApi.getProducts()
      ]);
      
      if (!abortControllerRef.current.signal.aborted) {
        setOrders(ordersData);
        setFillings(flavors);
        setProducts(productsResponse);
        
        const newStats = Object.entries(statusConfig).map(([status, config]) => ({
          status,
          ...config,
          count: ordersData.filter(o => o.status === status).length
        }));
        setStats(newStats);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error loading orders:', error);
        toast.error(error.message || 'Error al cargar los pedidos');
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [selectedStatus, debouncedSearchTerm, isPhoneSearch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getOrderPriority = (order: Order) => {
    const hoursUntilPickup = (order.pickupDate.getTime() - Date.now()) / (1000 * 60 * 60);
    const totalPortions = order.customCakes.reduce((sum, cake) => sum + cake.portions, 0);
    return hoursUntilPickup - (totalPortions / 10);
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => getOrderPriority(a) - getOrderPriority(b));
  }, [orders]);

  const handleCreateOrder = async (orderData: CreateOrderData) => {
    try {
      const newOrder = await ordersApi.createOrder(orderData);
      await loadOrders();
      toast.success('Pedido creado exitosamente');
      setIsNewOrderOpen(false);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Error al crear el pedido');
    }
  };

  const handleUpdateOrder = async (id: string, data: UpdateOrderData) => {
    try {
      data.pickupTime = data.pickupTime.slice(0,5);
      const updatedOrder = await ordersApi.updateOrder(id, data);
      await loadOrders();
      toast.success('Pedido actualizado exitosamente');
      setEditingOrder(null);
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(error.message || 'Error al actualizar el pedido');
    }
  };

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    try {
      const updatedOrder = await ordersApi.updateOrderStatus(id, status);
      await loadOrders();
      toast.success(`Estado actualizado a ${statusConfig[status].label}`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Error al actualizar el estado');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pedido?')) return;
    
    try {
      await ordersApi.deleteOrder(id);
      await loadOrders();
      toast.success('Pedido eliminado exitosamente');
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error(error.message || 'Error al eliminar el pedido');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    toast.info('Filtros restablecidos');
  };

  const handleEditOrder = async (o: Order) => {
    const order = await ordersApi.getOrderById(o.id);
    setEditingOrder(order);
  };

  const handleSelectOrder = async (o: Order) => {
    const order = await ordersApi.getOrderById(o.id);
    setSelectedOrder(order);
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
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
              <OrderForm
                onSubmit={handleCreateOrder}
                onClose={() => setIsNewOrderOpen(false)}
                products={products}
                flavors={fillings}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
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

        {/* Filters */}
        <Card className="mx-4 sm:mx-0">
          <CardContent className="p-3 sm:p-4">
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

                <Button 
                  variant="outline" 
                  size="icon" 
                  className="sm:w-10 h-10 shrink-0"
                  onClick={resetFilters}
                  title="Restablecer filtros"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

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

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isMobile ? (
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
                        <span className="font-bold text-primary text-sm">#{order.orderNumber}</span>
                        <Badge className={`${config.color} text-xs px-2 py-0.5`}>
                          <Icon className="h-3 w-3 mr-1 inline" />
                          {config.label}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleSelectOrder(order)}
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
                          <TableCell className="font-medium">#{order.orderNumber}</TableCell>
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
                                  {order.items.map((item,i) => `${item.quantity} ${item.productName}`).join(', ')}
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
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateStatus(order.id, value as OrderStatus)}
                            >
                              <SelectTrigger className={`${config.color} border-0 w-auto`}>
                                <Icon className="h-3 w-3 mr-1 inline" />
                                {config.label}
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(statusConfig).map(([statusValue, { label }]) => (
                                  <SelectItem key={statusValue} value={statusValue}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleSelectOrder(order)}
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
              <DialogTitle className="text-lg sm:text-xl">Pedido #{selectedOrder?.orderNumber}</DialogTitle>
            </DialogHeader>
            {selectedOrder && <OrderDetail order={selectedOrder} />}
          </DialogContent>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
          <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Editar Pedido #{editingOrder?.orderNumber}</DialogTitle>
            </DialogHeader>
            {editingOrder && (
              <OrderForm
                initialData={editingOrder}
                onSubmit={(data) => handleUpdateOrder(editingOrder.id, data)}
                onClose={() => setEditingOrder(null)}
                products={products}
                flavors={fillings}
                isEditing
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

// Componente de formulario reutilizable para crear y editar
interface OrderFormProps {
  initialData?: Order;
  onSubmit: (data: CreateOrderData | UpdateOrderData) => void;
  onClose: () => void;
  products: any[];
  flavors: any[];
  isEditing?: boolean;
}

function OrderForm({ initialData, onSubmit, onClose, products, flavors, isEditing = false }: OrderFormProps) {
  const [formData, setFormData] = useState<CreateOrderData | UpdateOrderData>(() => {
    if (initialData) {
      return {
        customerName: initialData.customerName,
        customerPhone: initialData.customerPhone,
        pickupDate: initialData.pickupDate,
        pickupTime: initialData.pickupTime,
        items: initialData.items,
        customCakes: initialData.customCakes,
        sweetTableCombo: initialData.sweetTableCombo ? initialData.sweetTableCombo : undefined,
        deliveryAddress: initialData.deliveryAddress,
        deliveryCost: initialData.deliveryCost,
        deposit: initialData.deposit,
        depositMethod: initialData.depositMethod,
        discount: initialData.discount,
        notes: initialData.notes,
      };
    }
    return {
      customerName: '',
      customerPhone: '',
      pickupDate: new Date(),
      pickupTime: '12:00',
      items: [],
      customCakes: [],
      deliveryCost: 0,
      deposit: 0,
      discount: 0,
      notes: '',
    };
  });

  const selectedOptions = {
    hasCake: (formData.customCakes?.length || 0) > 0,
    hasProducts: (formData.items?.length || 0) > 0,
    hasSweetTable: !!formData.sweetTableCombo
  };

  const calculateSubtotal = () => {
    let subtotal = 0;
    
    (formData.customCakes || []).forEach(cake => {
      subtotal += (cake.price || 0) * cake.quantity;
    });
    
    (formData.items || []).forEach(item => {
      subtotal += (item.price || 0) * item.quantity;
    });
    
    if (formData.sweetTableCombo) {
      subtotal += formData.sweetTableCombo.price || 0;
    }
    
    return subtotal;
  };

  const calculateTotal = () => {
    let total = calculateSubtotal();
    
    if (formData.discount) {
      total -= formData.discount;
    }
    
    if (formData.deliveryCost) {
      total += formData.deliveryCost;
    }
    
    return total;
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  const cakeFlavors = flavors.filter((f: any) => f.type === 'cake' && f.isActive);
  const fillingFlavors = flavors.filter((f: any) => f.type === 'filling' && f.isActive);
  const catalogProducts = products.filter((p: any) => p.isActive && p.location === 'store');

  const addCake = () => {
    const newCake: Partial<CustomCake> = {
      portions: 15,
      quantity: 1,
      cakeFlavor: '',
      secondCakeFlavor: '',
      fillingFlavor: '',
      secondFillingFlavor: '',
      price: 0,
      id: Date.now().toString()
    };
    setFormData({
      ...formData,
      customCakes: [...(formData.customCakes || []), newCake as CustomCake]
    });
  };

  const removeCake = (index: number) => {
    const updated = [...(formData.customCakes || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, customCakes: updated });
  };

  const updateCake = (index: number, field: keyof CustomCake, value: any) => {
    const updated = [...(formData.customCakes || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, customCakes: updated });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      items: [...(formData.items || []), { productId: '', quantity: 1, product: {} as any, price: 0 }]
    });
  };

  const removeProduct = (index: number) => {
    const updated = [...(formData.items || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, items: updated });
  };

  const updateProduct = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...(formData.items || [])];
    if (field === 'productId') {
      const selectedProduct = catalogProducts.find(p => p.id === value);
      if (selectedProduct) {
        updated[index] = {
          ...updated[index],
          productId: value,
          product: selectedProduct,
          price: selectedProduct.basePrice
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setFormData({ ...formData, items: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.customerName || !formData.customerPhone || !formData.pickupDate || !formData.pickupTime) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    if (!selectedOptions.hasCake && !selectedOptions.hasProducts && !selectedOptions.hasSweetTable) {
      toast.error('Debe seleccionar al menos un tipo de producto');
      return;
    }
    
    const submitData = {
      ...formData,
      total,
      orderType: selectedOptions.hasCake && selectedOptions.hasProducts ? 'mixed' :
                  selectedOptions.hasCake ? 'cake' :
                  selectedOptions.hasProducts ? 'products' : 'sweet_table'
    };
    
    onSubmit(submitData);
  };

  const updateFormField = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Nombre del cliente *</Label>
          <Input 
            placeholder="Nombre completo" 
            required 
            className="text-sm"
            value={formData.customerName || ''}
            onChange={(e) => updateFormField('customerName', e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Teléfono *</Label>
          <Input 
            placeholder="Número de teléfono" 
            required 
            className="text-sm"
            value={formData.customerPhone || ''}
            onChange={(e) => updateFormField('customerPhone', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Fecha de entrega *</Label>
          <Input 
            type="date" 
            required 
            className="text-sm"
            min={new Date().toISOString().split('T')[0]}
            value={formData.pickupDate instanceof Date ? format(formData.pickupDate, 'yyyy-MM-dd') : formData.pickupDate}
            onChange={(e) => {
              const [year, month, day] = e.target.value.split('-');
              const localDate = new Date(Number(year), Number(month) - 1, Number(day));
              updateFormField('pickupDate', localDate)
            }}
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">Hora de entrega *</Label>
          <Input 
            type="time" 
            required 
            className="text-sm"
            value={formData.pickupTime || ''}
            onChange={(e) => updateFormField('pickupTime', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 sm:justify-self-center justify-self-start">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={selectedOptions.hasCake}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      setFormData({ ...formData, customCakes: [] });
                    } else if ((formData.customCakes?.length || 0) === 0) {
                      addCake();
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
              <input 
                type="checkbox" 
                checked={selectedOptions.hasProducts}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setFormData({ ...formData, items: [] });
                  } else if ((formData.items?.length || 0) === 0) {
                    addProduct();
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
              <input 
                type="checkbox" 
                checked={selectedOptions.hasSweetTable}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setFormData({ ...formData, sweetTableCombo: undefined });
                  } else if (!formData.sweetTableCombo) {
                    setFormData({ 
                      ...formData, 
                      sweetTableCombo: { 
                        products: [], 
                        totalQuantity: 0, 
                        price: 0 
                      } 
                    });
                  }
                }}
                className="sr-only peer"
                id='hasSweetTable'
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
          
          {(formData.customCakes || []).map((cake, index) => (
            <div key={cake.id || index} className="border rounded-lg p-3 space-y-3 relative">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Torta #{index + 1}</span>
                {(formData.customCakes?.length || 0) > 1 && (
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
                  <Label className="text-sm">Sabor de torta *</Label>
                  <Select 
                    value={cake.cakeFlavor || undefined}
                    onValueChange={(v) => updateCake(index, 'cakeFlavor', v)}
                    required
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {cakeFlavors.map((f: any) => (
                        <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Sabor de relleno *</Label>
                  <Select
                    value={cake.fillingFlavor || undefined}
                    onValueChange={(v) => updateCake(index, 'fillingFlavor', v)}
                    required
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {fillingFlavors.map((f: any) => (
                        <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Segundo sabor de torta (opcional)</Label>
                  <Select 
                    value={cake.secondCakeFlavor || "none"}
                    onValueChange={(v) => updateCake(index, 'secondCakeFlavor', v === "none" ? "" : v)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      {cakeFlavors.map((f: any) => (
                        <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Segundo sabor de relleno (opcional)</Label>
                  <Select
                    value={cake.secondFillingFlavor || "none"}
                    onValueChange={(v) => updateCake(index, 'secondFillingFlavor', v === "none" ? "" : v)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      {fillingFlavors.map((f: any) => (
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
                <Label className="text-sm">Precio (Bs.) *</Label>
                <Input 
                  type="number"
                  placeholder="0" 
                  required
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
          
          {(formData.items || []).map((item, index) => (
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
                  <Label className="text-sm">Producto *</Label>
                  <Select 
                    value={item.productId}
                    onValueChange={(v) => updateProduct(index, 'productId', v)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogProducts.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} - Bs. {p.basePrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Cantidad *</Label>
                  <Input 
                    type="number" 
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-sm">Notas (opcional)</Label>
                <Input 
                  placeholder="Ej: Sin gluten, decoración especial..." 
                  className="text-sm"
                  value={item.notes || ''}
                  onChange={(e) => updateProduct(index, 'notes', e.target.value)}
                />
              </div>
            </div>
          ))}
          
          {(formData.items || []).length === 0 && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Cantidad de postres</Label>
                <Input 
                  type="number" 
                  placeholder="Ej: 75" 
                  className="text-sm"
                  value={formData.sweetTableCombo?.totalQuantity || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFormData({
                      ...formData,
                      sweetTableCombo: {
                        ...formData.sweetTableCombo!,
                        totalQuantity: value,
                        products: formData.sweetTableCombo?.products || []
                      }
                    });
                  }}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-sm">Precio total mesa dulce (Bs.) *</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  required
                  className="text-sm"
                  value={formData.sweetTableCombo?.price || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setFormData({
                      ...formData,
                      sweetTableCombo: {
                        ...formData.sweetTableCombo!,
                        price: value,
                        products: formData.sweetTableCombo?.products || []
                      }
                    });
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm">Detalles adicionales</Label>
              <Textarea 
                placeholder="Tipos de postres, presentación, colores..." 
                className="text-sm" 
                rows={2}
                value={formData.sweetTableCombo?.details || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    sweetTableCombo: {
                      ...formData.sweetTableCombo!,
                      details: e.target.value,
                      products: formData.sweetTableCombo?.products || []
                    }
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delivery y Pago */}
      <div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Dirección de envío (opcional)</Label>
          <Input 
            placeholder="Dirección o link de ubicación" 
            className="text-sm"
            value={formData.deliveryAddress || ''}
            onChange={(e) => updateFormField('deliveryAddress', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Costo de envío</Label>
            <Input 
              type="number" 
              placeholder="0" 
              className="text-sm"
              value={formData.deliveryCost || 0}
              onChange={(e) => updateFormField('deliveryCost', parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Garantía (opcional)</Label>
            <Input 
              placeholder="Descripción de garantía" 
              className="text-sm"
              value={formData.guarantee?.items || ''}
              onChange={(e) => updateFormField('guarantee', { amount: formData.guarantee?.amount || 0, items: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Adelanto *</Label>
            <Input 
              type="number" 
              placeholder="0" 
              required
              className="text-sm"
              value={formData.deposit || 0}
              onChange={(e) => updateFormField('deposit', parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Método de pago *</Label>
            <Select 
              value={formData.depositMethod || 'cash'}
              onValueChange={(v: any) => updateFormField('depositMethod', v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="qr">QR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Descuento</Label>
            <Input 
              type="number" 
              placeholder="0" 
              className="text-sm"
              value={formData.discount || 0}
              onChange={(e) => updateFormField('discount', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Notas adicionales</Label>
        <Textarea 
          placeholder="Observaciones del pedido..." 
          className="text-sm" 
          rows={3}
          value={formData.notes || ''}
          onChange={(e) => updateFormField('notes', e.target.value)}
        />
      </div>

      <div className="space-y-3 bg-muted/20 rounded-lg p-4 border">
        <div className="flex justify-between items-center py-2">
          <span className="font-medium text-sm">Subtotal:</span>
          <span className="text-lg font-semibold text-primary">
            Bs. {subtotal.toFixed(2)}
          </span>
        </div>
        
        {formData.discount > 0 && (
          <div className="flex justify-between items-center py-2 text-sm text-muted-foreground">
            <span>Descuento:</span>
            <span className="text-destructive">- Bs. {formData.discount.toFixed(2)}</span>
          </div>
        )}
        
        {formData.deliveryCost > 0 && (
          <div className="flex justify-between items-center py-2 text-sm text-muted-foreground">
            <span>Costo de envío:</span>
            <span>+ Bs. {formData.deliveryCost.toFixed(2)}</span>
          </div>
        )}
        
        <div className="border-t pt-3 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold">Total a pagar:</span>
            <span className="text-2xl font-bold text-primary">
              Bs. {total.toFixed(2)}
            </span>
          </div>
        </div>
        
        {formData.deposit > 0 && (
          <div className="flex justify-between items-center py-2 text-sm bg-muted p-2 rounded mt-2">
            <span className="font-medium">Adelanto:</span>
            <span className="text-green-600 font-medium">
              Bs. {formData.deposit.toFixed(2)}
            </span>
          </div>
        )}
        
        {formData.deposit > 0 && total > 0 && (
          <div className="flex justify-between items-center py-2 text-sm font-medium">
            <span>Saldo pendiente:</span>
            <span className="text-lg font-semibold text-orange-600">
              Bs. {(total - formData.deposit).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
          {isEditing ? 'Actualizar Pedido' : 'Crear Pedido'}
        </Button>
      </div>
    </form>
  );
}

// OrderDetail component con toda la información
function OrderDetail({ order }: { order: Order }) {
  return (
    <div className="space-y-3 sm:space-y-4 px-1">
      {/* Información del cliente y entrega */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">Cliente</p>
          <p className="font-medium text-sm sm:text-base">{order.customerName}</p>
          <p className="text-xs sm:text-sm">{order.customerPhone}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">Entrega</p>
          <p className="font-medium text-sm sm:text-base">
            {format(order.pickupDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          <p className="text-xs sm:text-sm">{order.pickupTime}</p>
        </div>
      </div>

      {/* Información del pedido */}
      <div className="border-t pt-3 sm:pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Tipo de pedido</p>
            <p className="text-sm font-medium capitalize">{getOrderType(order.orderType)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha de creación</p>
            <p className="text-sm">{format(order.createdAt, "dd/MM/yyyy HH:mm")}</p>
          </div>
        </div>
      </div>

      {/* Tortas personalizadas */}
      {order.customCakes.length > 0 && (
        <div className="border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm sm:text-base mb-2">🎂 Tortas personalizadas</h4>
          {order.customCakes.map((cake, i) => (
            <div key={i} className="bg-muted/50 p-3 rounded-lg mb-2">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">
                    {cake.quantity > 1 ? `${cake.quantity} x ` : ''}
                    {cake.portions} porciones
                  </p>
                  <p className="text-sm mt-1">
                    Sabores: {cake.cakeFlavor}
                    {cake.secondCakeFlavor && ` / ${cake.secondCakeFlavor}`}
                  </p>
                  <p className="text-sm">
                    Rellenos: {cake.fillingFlavor}
                    {cake.secondFillingFlavor && ` / ${cake.secondFillingFlavor}`}
                  </p>
                </div>
                <p className="font-bold text-primary">Bs. {cake.price * cake.quantity}</p>
              </div>
              {cake.shape && (
                <p className="text-sm text-muted-foreground">Forma: {cake.shape}</p>
              )}
              {cake.design && (
                <p className="text-sm mt-1">🎨 Diseño: {cake.design}</p>
              )}
              {cake.dedication && (
                <p className="text-sm italic">💝 "{cake.dedication}"</p>
              )}
              {cake.referenceImages && cake.referenceImages.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  📸 {cake.referenceImages.length} imágenes de referencia
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Productos del catálogo */}
      {order.items.length > 0 && (
        <div className="border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm sm:text-base mb-2">📦 Productos del catálogo</h4>
          {order.items.map((item, i) => (
            <div key={i} className="bg-muted/50 p-3 rounded-lg mb-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">
                    {item.quantity} x {item.product?.name || item.productName}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-1">📝 {item.notes}</p>
                  )}
                </div>
                <p className="font-medium">Bs. {item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mesa Dulce */}
      {order.sweetTableCombo && (
        <div className="border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm sm:text-base mb-2">🍰 Mesa Dulce</h4>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{order.sweetTableCombo.totalQuantity} postres</p>
                {order.sweetTableCombo.details && (
                  <p className="text-sm mt-1">{order.sweetTableCombo.details}</p>
                )}
              </div>
              <p className="font-bold text-primary">Bs. {order.sweetTableCombo.price}</p>
            </div>
          </div>
        </div>
      )}

      {/* Información de envío */}
      {order.deliveryAddress && (
        <div className="border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm sm:text-base mb-2">🚚 Información de envío</h4>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm">Dirección: {order.deliveryAddress}</p>
            <p className="text-sm mt-1">Costo de envío: Bs. {order.deliveryCost}</p>
          </div>
        </div>
      )}

      {/* Garantía */}
      {order.guarantee && (
        <div className="border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm sm:text-base mb-2">🔒 Garantía</h4>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm">Artículos: {order.guarantee.items}</p>
            <p className="text-sm mt-1">Valor: Bs. {order.guarantee.amount}</p>
          </div>
        </div>
      )}

      {/* Cupón / Descuento */}
      {order.couponCode && (
        <div className="border-t pt-3 sm:pt-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm">🎫 Cupón aplicado: {order.couponCode}</p>
            <p className="text-sm">Descuento: Bs. {order.discount || 0}</p>
          </div>
        </div>
      )}

      {/* Notas adicionales */}
      {order.notes && (
        <div className="border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm sm:text-base mb-2">📝 Notas adicionales</h4>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
          </div>
        </div>
      )}

      {/* Totales */}
      <div className="border-t pt-3 sm:pt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>Bs. {order.total + (order.discount || 0) - (order.deliveryCost || 0)}</span>
          </div>
          {order.deliveryCost > 0 && (
            <div className="flex justify-between text-sm">
              <span>Costo de envío:</span>
              <span>+ Bs. {order.deliveryCost}</span>
            </div>
          )}
          {order.discount && order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento:</span>
              <span>- Bs. {order.discount}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t">
            <p className="font-semibold">Total</p>
            <p className="text-xl font-bold text-primary">Bs. {order.total}</p>
          </div>
          <div className="flex justify-between text-sm">
            <span>Adelanto pagado:</span>
            <span className="font-medium">Bs. {order.deposit}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Saldo pendiente:</span>
            <span className={`font-medium ${order.total - order.deposit > 0 ? 'text-orange-500' : 'text-green-600'}`}>
              Bs. {order.total - order.deposit}
            </span>
          </div>
          {order.depositMethod && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Método de pago:</span>
              <span className="uppercase">{order.depositMethod}</span>
            </div>
          )}
        </div>
      </div>

      {/* Estado del pedido */}
      <div className="border-t pt-3 flex flex-wrap justify-between items-center gap-2">
        <Badge className={statusConfig[order.status].color}>
          {statusConfig[order.status].label}
        </Badge>
        <p className="text-xs text-muted-foreground">
          Creado por: {order.createdByUsername}
        </p>
      </div>
    </div>
  );
}