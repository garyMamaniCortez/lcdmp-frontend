import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Truck, Clock, MapPin, Phone, CheckCircle, Package, Navigation } from 'lucide-react';
import { mockOrders } from '@/data/mockData';
import { format, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Delivery() {
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  // Filter orders ready for delivery
  const deliveryOrders = mockOrders
    .filter(o => o.status === 'ready' && o.deliveryAddress)
    .sort((a, b) => {
      const hoursA = differenceInHours(a.pickupDate, new Date());
      const hoursB = differenceInHours(b.pickupDate, new Date());
      return hoursA - hoursB;
    });

  const pickupOrders = mockOrders
    .filter(o => o.status === 'ready' && !o.deliveryAddress)
    .sort((a, b) => {
      const hoursA = differenceInHours(a.pickupDate, new Date());
      const hoursB = differenceInHours(b.pickupDate, new Date());
      return hoursA - hoursB;
    });

  const getUrgencyBadge = (order: typeof mockOrders[0]) => {
    const hoursUntil = differenceInHours(order.pickupDate, new Date());
    if (hoursUntil < 2) return { label: 'Urgente', color: 'bg-red-500' };
    if (hoursUntil < 6) return { label: 'Pronto', color: 'bg-orange-500' };
    return { label: 'Normal', color: 'bg-green-500' };
  };

  const completeDelivery = () => {
    toast.success('Entrega completada exitosamente');
    setIsCompleteDialogOpen(false);
    setSelectedOrder(null);
  };

  const openMaps = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Delivery</h1>
            <p className="text-muted-foreground">Gestión de entregas y recogidas</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{deliveryOrders.length}</p>
                <p className="text-sm text-muted-foreground">Para entregar</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pickupOrders.length}</p>
                <p className="text-sm text-muted-foreground">Para recoger</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-800 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {[...deliveryOrders, ...pickupOrders].filter(o => differenceInHours(o.pickupDate, new Date()) < 2).length}
                </p>
                <p className="text-sm text-muted-foreground">Urgentes (&lt;2h)</p>
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
                  {mockOrders.filter(o => o.status === 'delivered').length}
                </p>
                <p className="text-sm text-muted-foreground">Entregados hoy</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Entregas a Domicilio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliveryOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay entregas pendientes
                </p>
              ) : (
                deliveryOrders.map(order => {
                  const urgency = getUrgencyBadge(order);
                  const hoursUntil = differenceInHours(order.pickupDate, new Date());
                  
                  return (
                    <div 
                      key={order.id} 
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className={`w-2 h-full min-h-20 rounded-full ${urgency.color}`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">Pedido #{order.id}</h3>
                          <Badge className={urgency.color}>{urgency.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{order.customerName}</span>
                          <span className="text-muted-foreground">•</span>
                          <a href={`tel:${order.customerPhone}`} className="text-primary flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.customerPhone}
                          </a>
                        </div>
                        <div className="flex items-start gap-1 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{order.deliveryAddress}</span>
                        </div>
                        <p className="text-sm mt-1">
                          Costo de envío: <strong>Bs. {order.deliveryCost}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {hoursUntil > 0 ? `${hoursUntil}h` : 'Atrasado'}
                          </span>
                        </div>
                        <p className="text-sm">
                          {format(order.pickupDate, 'dd MMM', { locale: es })} {order.pickupTime}
                        </p>
                        <p className="font-bold text-primary mt-1">Bs. {order.total}</p>
                        <p className="text-xs text-muted-foreground">
                          Saldo: Bs. {order.total - order.deposit}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openMaps(order.deliveryAddress!)}
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Mapa
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => { setSelectedOrder(order); setIsCompleteDialogOpen(true); }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Entregado
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pickups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recogidas en Tienda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pickupOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay recogidas pendientes
                </p>
              ) : (
                pickupOrders.map(order => {
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
                          <Badge className={urgency.color}>{urgency.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{order.customerName}</span>
                          <span className="text-muted-foreground">•</span>
                          <a href={`tel:${order.customerPhone}`} className="text-primary flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.customerPhone}
                          </a>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {hoursUntil > 0 ? `${hoursUntil}h` : 'Atrasado'}
                          </span>
                        </div>
                        <p className="text-sm">
                          {format(order.pickupDate, 'dd MMM', { locale: es })} {order.pickupTime}
                        </p>
                        <p className="font-bold text-primary mt-1">Bs. {order.total}</p>
                        <p className="text-xs text-muted-foreground">
                          Saldo: Bs. {order.total - order.deposit}
                        </p>
                      </div>

                      <Button 
                        size="sm"
                        onClick={() => { setSelectedOrder(order); setIsCompleteDialogOpen(true); }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Entregado
                      </Button>
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
              <DialogTitle>Confirmar Entrega</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">Pedido #{selectedOrder.id}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerName}</p>
                  {selectedOrder.deliveryAddress && (
                    <p className="text-sm mt-1">{selectedOrder.deliveryAddress}</p>
                  )}
                </div>

                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Saldo pendiente</p>
                  <p className="text-2xl font-bold text-primary">
                    Bs. {selectedOrder.total - selectedOrder.deposit}
                  </p>
                </div>

                {selectedOrder.guarantee && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="font-medium text-orange-800">Garantía a recuperar</p>
                    <p className="text-sm text-orange-700">
                      Bs. {selectedOrder.guarantee.amount} - {selectedOrder.guarantee.items}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notas de entrega (opcional)</Label>
                  <Textarea placeholder="Observaciones de la entrega..." />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={completeDelivery}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Entrega
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
