import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { MobileCard, MobileCardHeader, useIsMobile } from '@/components/ui/responsive-table';
import { ChefHat, Clock, AlertTriangle, CheckCircle, Flame, ArrowRight } from 'lucide-react';
import { mockOrders, mockBakedProducts } from '@/data/mockData';
import { format, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Baking() {
  const isMobile = useIsMobile();
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  // Filter orders that need baking (pending or baking status)
  const bakingOrders = mockOrders
    .filter(o => o.status === 'pending' || o.status === 'baking')
    .sort((a, b) => {
      const hoursA = differenceInHours(a.pickupDate, new Date());
      const hoursB = differenceInHours(b.pickupDate, new Date());
      const portionsA = a.customCakes.reduce((sum, c) => sum + c.portions, 0);
      const portionsB = b.customCakes.reduce((sum, c) => sum + c.portions, 0);
      return (hoursA - portionsA/10) - (hoursB - portionsB/10);
    });

  const totalPortionsNeeded = bakingOrders.reduce(
    (sum, order) => sum + order.customCakes.reduce((s, c) => s + c.portions, 0),
    0
  );

  const getUrgencyBadge = (order: typeof mockOrders[0]) => {
    const hoursUntil = differenceInHours(order.pickupDate, new Date());
    if (hoursUntil < 12) return { label: 'Urgente', color: 'bg-red-500' };
    if (hoursUntil < 24) return { label: 'Pronto', color: 'bg-orange-500' };
    return { label: 'Normal', color: 'bg-green-500' };
  };

  const markAsBaking = (order: typeof mockOrders[0]) => {
    toast.success(`Pedido #${order.id} marcado como horneando`);
  };

  const completeBaking = () => {
    toast.success('Horneado completado y registrado en inventario');
    setIsCompleteDialogOpen(false);
    setSelectedOrder(null);
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header - Mobile first */}
        <div className="px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Hornos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestión de productos a hornear
          </p>
        </div>

        {/* Stats - Mobile: 2 columnas, Tablet/Desktop: 4 columnas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 px-4 sm:px-0">
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-orange-100 text-orange-800 rounded-lg">
                <ChefHat className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{bakingOrders.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Pedidos pendientes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 text-primary rounded-lg">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{totalPortionsNeeded}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Porciones a hornear</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-red-100 text-red-800 rounded-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">
                  {bakingOrders.filter(o => differenceInHours(o.pickupDate, new Date()) < 12).length}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Urgentes (&lt;12h)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 text-green-800 rounded-lg">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">
                  {mockOrders.filter(o => o.status !== 'pending' && o.status !== 'baking').length}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Completados hoy</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Baked Products Stock */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader className="px-4 py-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Stock de Bases Horneadas</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              {mockBakedProducts.filter(p => p.type === 'cake_base').map(product => {
                const isLowStock = product.quantity <= product.minStock;
                return (
                  <div 
                    key={product.id} 
                    className={`p-2 sm:p-3 rounded-lg ${
                      isLowStock ? 'bg-red-50 border border-red-200' : 'bg-muted/50'
                    }`}
                  >
                    <p className="font-medium text-xs sm:text-sm truncate">{product.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-base sm:text-lg font-bold ${isLowStock ? 'text-red-600' : ''}`}>
                        {product.quantity}
                      </span>
                      <span className="text-xs text-muted-foreground">/ mín {product.minStock}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader className="px-4 py-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Pedidos para Hornear</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6">
            {bakingOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No hay pedidos pendientes de hornear
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {bakingOrders.map(order => {
                  const urgency = getUrgencyBadge(order);
                  const hoursUntil = differenceInHours(order.pickupDate, new Date());
                  
                  return isMobile ? (
                    // Mobile Card Layout
                    <MobileCard 
                      key={order.id} 
                      className={`overflow-hidden ${
                        order.status === 'baking' ? 'border-primary' : ''
                      }`}
                    >
                      <div className="flex">
                        {/* Urgency color bar */}
                        <div className={`w-1.5 min-h-full ${urgency.color}`} />
                        
                        <div className="flex-1 p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-medium text-sm">Pedido #{order.id}</h3>
                                <Badge variant={order.status === 'baking' ? 'default' : 'secondary'} className="text-xs">
                                  {order.status === 'baking' ? 'Horneando' : 'Pendiente'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{order.customerName}</p>
                            </div>
                            <Badge className={`${urgency.color} text-white text-xs`}>
                              {urgency.label}
                            </Badge>
                          </div>

                          <div className="space-y-2 mt-2">
                            {order.customCakes.map((cake, i) => (
                              <div key={i} className="text-xs bg-muted/50 p-2 rounded">
                                <p className="font-medium">{cake.portions} porciones - {cake.cakeFlavor}</p>
                                {cake.shape && <p className="text-muted-foreground mt-0.5">{cake.shape}</p>}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="text-xs">
                                {hoursUntil > 0 ? `${hoursUntil}h` : 'Atrasado'}
                              </span>
                              <span className="text-xs ml-1">
                                {format(order.pickupDate, 'dd MMM', { locale: es })} {order.pickupTime}
                              </span>
                            </div>

                            {order.status === 'pending' && (
                              <Button size="sm" className="h-8 text-xs" onClick={() => markAsBaking(order)}>
                                Iniciar
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                            {order.status === 'baking' && (
                              <Button 
                                size="sm" 
                                variant="default"
                                className="h-8 text-xs"
                                onClick={() => { setSelectedOrder(order); setIsCompleteDialogOpen(true); }}
                              >
                                Completar
                                <CheckCircle className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </MobileCard>
                  ) : (
                    // Desktop Layout
                    <div 
                      key={order.id} 
                      className={`flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors ${
                        order.status === 'baking' ? 'border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className={`w-2 h-full min-h-16 rounded-full ${urgency.color}`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium">Pedido #{order.id}</h3>
                          <Badge variant={order.status === 'baking' ? 'default' : 'secondary'}>
                            {order.status === 'baking' ? 'Horneando' : 'Pendiente'}
                          </Badge>
                          <Badge className={urgency.color}>{urgency.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        <div className="mt-2 space-y-1">
                          {order.customCakes.map((cake, i) => (
                            <p key={i} className="text-sm">
                              <strong>{cake.portions} porciones</strong> - {cake.cakeFlavor}
                              {cake.shape && ` (${cake.shape})`}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-muted-foreground mb-2 justify-end">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            {hoursUntil > 0 ? `${hoursUntil}h` : 'Atrasado'}
                          </span>
                        </div>
                        <p className="text-sm font-medium whitespace-nowrap">
                          {format(order.pickupDate, 'dd MMM', { locale: es })} {order.pickupTime}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {order.status === 'pending' && (
                          <Button size="sm" onClick={() => markAsBaking(order)}>
                            Iniciar
                          </Button>
                        )}
                        {order.status === 'baking' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => { setSelectedOrder(order); setIsCompleteDialogOpen(true); }}
                          >
                            Completar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete Dialog - Mobile optimized */}
        <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Completar Horneado</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 px-1">
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm sm:text-base">Pedido #{selectedOrder.id}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedOrder.customerName}</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm">Cantidades horneadas</Label>
                  {selectedOrder.customCakes.map((cake, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                      <span className="text-xs sm:text-sm">
                        {cake.cakeFlavor} ({cake.portions}p)
                      </span>
                      <Input 
                        type="number" 
                        defaultValue="1" 
                        className="w-full sm:w-20" 
                        min="0"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCompleteDialogOpen(false)}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={completeBaking} className="w-full sm:w-auto order-1 sm:order-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Horneado
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}