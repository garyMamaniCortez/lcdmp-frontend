import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MobileCard, useIsMobile } from '@/components/ui/responsive-table';
import { Palette, Clock, AlertTriangle, CheckCircle, Image, Eye, ArrowRight } from 'lucide-react';
import { mockOrders } from '@/data/mockData';
import { format, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Decoration() {
  const isMobile = useIsMobile();
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
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header - Mobile first */}
        <div className="px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Decoración
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Diseño y decoración de tortas
          </p>
        </div>

        {/* Stats - Mobile: 2 columnas, Tablet/Desktop: 3 columnas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 px-4 sm:px-0">
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-purple-100 text-purple-800 rounded-lg">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{decorationOrders.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Pendientes de decorar</p>
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
                  {decorationOrders.filter(o => differenceInHours(o.pickupDate, new Date()) < 6).length}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Urgentes (&lt;6h)</p>
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
                  {mockOrders.filter(o => o.status === 'ready' || o.status === 'delivered').length}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Completados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader className="px-4 py-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Pedidos para Decorar</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6">
            {decorationOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No hay pedidos pendientes de decorar
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {decorationOrders.map(order => {
                  const urgency = getUrgencyBadge(order);
                  const hoursUntil = differenceInHours(order.pickupDate, new Date());
                  
                  return isMobile ? (
                    // Mobile Card Layout
                    <MobileCard 
                      key={order.id} 
                      className="overflow-hidden"
                      onClick={() => { setSelectedOrder(order); setIsDetailDialogOpen(true); }}
                    >
                      <div className="flex">
                        {/* Urgency color bar - vertical a la izquierda */}
                        <div className={`w-1.5 min-h-full ${urgency.color}`} />
                        
                        <div className="flex-1 p-3">
                          {/* Header con badges */}
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-medium text-sm">Pedido #{order.id}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  Decorando
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
                                {cake.shape && 
                                  <p className="text-muted-foreground mt-0.5">{cake.shape}</p>}
                                {cake.design && 
                                  <p className="text-muted-foreground mt-0.5">🎨 {cake.design}</p>
                                }
                              </div>
                            ))}
                          </div>

                          {/* Footer con tiempo y botones */}
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
                            <Button 
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => { setSelectedOrder(order); setIsCompleteDialogOpen(true); }}
                            >
                              Completar
                              <CheckCircle className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </MobileCard>
                  ) : (
                    // Desktop Layout
                    <div 
                      key={order.id} 
                      className="flex items-center gap-4 p-4 rounded-lg transition-colors bg-muted/50 hover:bg-muted"
                    >
                      <div className={`w-2 h-full min-h-16 rounded-full ${urgency.color}`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium">Pedido #{order.id}</h3>
                          <Badge variant="secondary">Decorando</Badge>
                          <Badge className={urgency.color}>{urgency.label}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{order.customerName}</p>
                        
                        <div className="space-y-2">
                          {order.customCakes.map((cake, i) => (
                            <div key={i} className="space-y-1">
                              <p className="text-sm">
                                <strong>{cake.portions} porciones</strong> - {cake.cakeFlavor}
                                {cake.shape && <span className="text-muted-foreground"> ({cake.shape})</span>}  
                                <br />
                                {cake.design && (
                                  <span className="text-muted-foreground">
                                    🎨 {cake.design}
                                  </span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Precio total (si hay múltiples tortas) */}
                        {order.customCakes.length > 1 && (
                          <div className="flex justify-end mt-3 pt-2 border-t">
                            <span className="font-bold text-primary">
                              Total: Bs. {order.customCakes.reduce((sum, cake) => sum + cake.price, 0)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-muted-foreground justify-end">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {hoursUntil > 0 ? `${hoursUntil}h` : 'Atrasado'}
                          </span>
                        </div>
                        <p className="text-sm whitespace-nowrap">
                          {format(order.pickupDate, 'dd MMM', { locale: es })} {order.pickupTime}
                        </p>
                      </div>

                      <Button 
                        size="sm"
                        onClick={() => { setSelectedOrder(order); setIsCompleteDialogOpen(true); }}
                        className="whitespace-nowrap"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog - Mobile optimized */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Detalles del Pedido #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 px-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium text-sm">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium text-sm">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Fecha de entrega</p>
                    <p className="font-medium text-sm">
                      {format(selectedOrder.pickupDate, 'dd MMMM yyyy', { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Hora</p>
                    <p className="font-medium text-sm">{selectedOrder.pickupTime}</p>
                  </div>
                </div>

                {selectedOrder.customCakes.map((cake, i) => (
                  <div key={i} className="p-3 sm:p-4 bg-muted/50 rounded-lg space-y-2">
                    <h4 className="font-medium text-sm sm:text-base">
                      {cake.cakeFlavor} - {cake.portions} porciones
                    </h4>
                    {cake.shape && <p className="text-xs sm:text-sm">Forma: {cake.shape}</p>}
                    <p className="text-xs sm:text-sm">Relleno: {cake.fillingFlavors.join(', ')}</p>
                    {cake.design && (
                      <div className="p-2 sm:p-3 bg-background rounded border">
                        <p className="text-xs sm:text-sm font-medium">Diseño requerido:</p>
                        <p className="text-xs sm:text-sm mt-1">{cake.design}</p>
                      </div>
                    )}
                    {cake.dedication && (
                      <p className="text-xs sm:text-sm">Dedicatoria: "{cake.dedication}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Complete Dialog - Mobile optimized */}
        <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Completar Decoración</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 px-1">
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm sm:text-base">Pedido #{selectedOrder.id}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedOrder.customerName}</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm">Confirmar decoración de:</Label>
                  {selectedOrder.customCakes.map((cake, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                      <Checkbox id={`cake-dec-${i}`} defaultChecked className="mt-0.5" />
                      <div className="flex-1">
                        <label 
                          htmlFor={`cake-dec-${i}`} 
                          className="font-medium text-sm cursor-pointer"
                        >
                          {cake.cakeFlavor} - {cake.portions} porciones
                        </label>
                        {cake.design && (
                          <p className="text-xs text-muted-foreground mt-1">{cake.design}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Notas de decoración (opcional)</Label>
                  <Textarea 
                    placeholder="Observaciones adicionales..." 
                    className="text-sm min-h-[80px] sm:min-h-[100px]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCompleteDialogOpen(false)}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={completeDecoration} className="w-full sm:w-auto order-1 sm:order-2">
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
