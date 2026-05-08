import { getOrderType } from "@/pages/Orders";
import { Order } from "@/types";
import { format } from 'date-fns';
import { Badge, Truck } from "lucide-react";
import { statusConfig } from '@/types/consts';
import { es } from "date-fns/locale";
import { Button } from "../ui/button";
import { PaymentMethod } from '../../types/index';
import { useState } from "react";

interface OrderDetailProps {
  order: Order;
  onDeliver?: (orderId: string, paymentMethod: PaymentMethod) => void;
}

export default function OrderDetail({ order, onDeliver }: OrderDetailProps) {
  const [ paymentMethod, setPaymentMethod ]= useState<PaymentMethod>('cash');
  const handleDeliver = () => {
    if (onDeliver) {
      onDeliver(order.id, paymentMethod);
    }
  };
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

      {order.status !== 'delivered' && onDeliver && (
        <div className="border-t pt-3 sm:pt-4">
          <Button 
            onClick={handleDeliver}
            className="w-full"
          >
            <Truck className="h-4 w-4 mr-2" />
            Marcar como Entregado
          </Button>
        </div>
      )}

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