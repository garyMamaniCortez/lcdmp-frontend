import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Clock, AlertTriangle, CheckCircle, Image, Eye } from 'lucide-react';
import { mockOrders } from '@/data/mockData';
import { format, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Decoration() {
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Filter orders that need decoration
  const decorationOrders = mockOrders
    .filter(o => o.status === 'decorating')
    .sort((a, b) => {
      const hoursA = differenceInHours(a.pickupDate, new Date());
      const hoursB = differenceInHours(b.pickupDate, new Date());
      const priceA = a.customCakes.reduce((sum, c) => sum + c.price, 0);
      const priceB = b.customCakes.reduce((sum, c) => sum + c.price, 0);
      return (hoursA - priceA/100) - (hoursB - priceB/100);
    });

  const getUrgencyBadge = (order: typeof mockOrders[0]) => {
    const hoursUntil = differenceInHours(order.pickupDate, new Date());
    if (hoursUntil < 6) return { label: 'Urgente', color: 'bg-red-500' };
    if (hoursUntil < 12) return { label: 'Pronto', color: 'bg-orange-500' };
    return { label: 'Normal', color: 'bg-green-500' };
  };

  const completeDecoration = () => {
    toast.success('Decoración completada, pedido listo para entrega');
    setIsCompleteDialogOpen(false);
    setSelectedOrder(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Decoración</h1>
            <p className="text-muted-foreground">Diseño y decoración de tortas</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{decorationOrders.length}</p>
                <p className="text-sm text-muted-foreground">Pendientes de decorar</p>
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
                  {decorationOrders.filter(o => differenceInHours(o.pickupDate, new Date()) < 6).length}
                </p>
                <p className="text-sm text-muted-foreground">Urgentes (&lt;6h)</p>
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
                  {mockOrders.filter(o => o.status === 'ready' || o.status === 'delivered').length}
                </p>
                <p className="text-sm text-muted-foreground">Completados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decorationOrders.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="p-8 text-center">
                <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay pedidos pendientes de decorar</p>
              </CardContent>
            </Card>
          ) : (
            decorationOrders.map(order => {
              const urgency = getUrgencyBadge(order);
              const hoursUntil = differenceInHours(order.pickupDate, new Date());
              
              return (
                <Card key={order.id} className="overflow-hidden">
                  <div className={`h-2 ${urgency.color}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          Pedido #{order.id}
                          <Badge className={urgency.color}>{urgency.label}</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{hoursUntil > 0 ? `${hoursUntil}h` : 'Atrasado'}</span>
                        </div>
                        <p className="text-sm font-medium">
                          {format(order.pickupDate, 'dd MMM', { locale: es })} {order.pickupTime}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.customCakes.map((cake, i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{cake.cakeFlavor} - {cake.portions}p</p>
                              {cake.shape && <p className="text-sm text-muted-foreground">Forma: {cake.shape}</p>}
                            </div>
                            <span className="font-bold text-primary">Bs. {cake.price}</span>
                          </div>
                          {cake.design && (
                            <div className="mt-2 p-2 bg-background rounded border">
                              <p className="text-sm"><strong>Diseño:</strong> {cake.design}</p>
                            </div>
                          )}
                          {cake.dedication && (
                            <p className="text-sm mt-1"><strong>Dedicatoria:</strong> "{cake.dedication}"</p>
                          )}
                          {cake.referenceImages.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-primary">
                              <Image className="h-4 w-4" />
                              {cake.referenceImages.length} imagen(es) de referencia
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => { setSelectedOrder(order); setIsDetailDialogOpen(true); }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => { setSelectedOrder(order); setIsCompleteDialogOpen(true); }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalles del Pedido #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fecha de entrega</p>
                    <p className="font-medium">{format(selectedOrder.pickupDate, 'dd MMMM yyyy', { locale: es })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hora</p>
                    <p className="font-medium">{selectedOrder.pickupTime}</p>
                  </div>
                </div>

                {selectedOrder.customCakes.map((cake, i) => (
                  <div key={i} className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <h4 className="font-medium">{cake.cakeFlavor} - {cake.portions} porciones</h4>
                    {cake.shape && <p className="text-sm">Forma: {cake.shape}</p>}
                    <p className="text-sm">Relleno: {cake.fillingFlavors.join(', ')}</p>
                    {cake.design && (
                      <div className="p-2 bg-background rounded border">
                        <p className="text-sm font-medium">Diseño requerido:</p>
                        <p className="text-sm">{cake.design}</p>
                      </div>
                    )}
                    {cake.dedication && (
                      <p className="text-sm">Dedicatoria: "{cake.dedication}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Complete Dialog */}
        <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Completar Decoración</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">Pedido #{selectedOrder.id}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerName}</p>
                </div>

                <div className="space-y-3">
                  <Label>Confirmar decoración de:</Label>
                  {selectedOrder.customCakes.map((cake, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Checkbox id={`cake-dec-${i}`} defaultChecked />
                      <div>
                        <label htmlFor={`cake-dec-${i}`} className="font-medium cursor-pointer">
                          {cake.cakeFlavor} - {cake.portions} porciones
                        </label>
                        {cake.design && <p className="text-sm text-muted-foreground">{cake.design}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Notas de decoración (opcional)</Label>
                  <Textarea placeholder="Observaciones adicionales..." />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={completeDecoration}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Listo
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
