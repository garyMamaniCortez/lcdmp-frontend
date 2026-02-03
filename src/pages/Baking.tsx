import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ChefHat, Clock, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { mockOrders, mockBakedProducts } from '@/data/mockData';
import { format, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Baking() {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Hornos</h1>
            <p className="text-muted-foreground">Gestión de productos a hornear</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-800 rounded-lg">
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bakingOrders.length}</p>
                <p className="text-sm text-muted-foreground">Pedidos pendientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPortionsNeeded}</p>
                <p className="text-sm text-muted-foreground">Porciones a hornear</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-800 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {bakingOrders.filter(o => differenceInHours(o.pickupDate, new Date()) < 12).length}
                </p>
                <p className="text-sm text-muted-foreground">Urgentes (&lt;12h)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-800 rounded-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockOrders.filter(o => o.status !== 'pending' && o.status !== 'baking').length}
                </p>
                <p className="text-sm text-muted-foreground">Completados hoy</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Baked Products Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stock de Bases Horneadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockBakedProducts.filter(p => p.type === 'cake_base').map(product => {
                const isLowStock = product.quantity <= product.minStock;
                return (
                  <div key={product.id} className={`p-3 rounded-lg ${isLowStock ? 'bg-red-50 border border-red-200' : 'bg-muted/50'}`}>
                    <p className="font-medium text-sm">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-lg font-bold ${isLowStock ? 'text-red-600' : ''}`}>
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
        <Card>
          <CardHeader>
            <CardTitle>Pedidos para Hornear</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bakingOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay pedidos pendientes de hornear
                </p>
              ) : (
                bakingOrders.map(order => {
                  const urgency = getUrgencyBadge(order);
                  const hoursUntil = differenceInHours(order.pickupDate, new Date());
                  
                  return (
                    <div 
                      key={order.id} 
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className={`w-2 h-full min-h-16 rounded-full ${urgency.color}`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
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
                        <div className="flex items-center gap-1 text-muted-foreground mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            {hoursUntil > 0 ? `${hoursUntil}h` : 'Atrasado'}
                          </span>
                        </div>
                        <p className="text-sm font-medium">
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
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Complete Dialog */}
        <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Completar Horneado</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">Pedido #{selectedOrder.id}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerName}</p>
                </div>

                <div className="space-y-3">
                  <Label>Cantidades horneadas</Label>
                  {selectedOrder.customCakes.map((cake, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <span className="text-sm">
                        {cake.cakeFlavor} ({cake.portions}p)
                      </span>
                      <Input 
                        type="number" 
                        defaultValue="1" 
                        className="w-20" 
                        min="0"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={completeBaking}>
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
