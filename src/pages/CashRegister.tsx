import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileCard, useIsMobile } from '@/components/ui/responsive-table';
import { Plus, QrCode, Banknote, Lock, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { ICashRegisterApi, defaultCashRegisterApi } from '@/api/CashRegisterApi';
import { DailySummary } from '@/types';

interface CashRegisterProps {
  cashRegisterApi?: ICashRegisterApi;
}

export default function CashRegister({ cashRegisterApi = defaultCashRegisterApi }: CashRegisterProps) {
  const isMobile = useIsMobile();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isCloseRegisterOpen, setIsCloseRegisterOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'sale' | 'deposit' | 'expense'>('sale');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Form states
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionMethod, setTransactionMethod] = useState<'cash' | 'qr'>('cash');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [countedCash, setCountedCash] = useState('');
  const [tomorrowOpeningBalance, setTomorrowOpeningBalance] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  
  // Cargar datos al montar el componente
  useEffect(() => {
    loadDailyData();
  }, []);
  
  const loadDailyData = async () => {
    try {
      setLoading(true);
      const [dailySummary, status] = await Promise.all([
        cashRegisterApi.getDailySummary(),
        cashRegisterApi.getCurrentStatus()
      ]);
      setSummary(dailySummary);
      setIsOpen(status.isOpen);
      
      // Actualizar el saldo para mañana en el formulario de cierre
      if (dailySummary.openingBalance) {
        setTomorrowOpeningBalance(dailySummary.openingBalance.toString());
      }
    } catch (error: any) {
      console.error('Error loading daily data:', error);
      toast.error(error.message || 'Error al cargar los datos de caja');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionAmount || !transactionDescription) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    
    try {
      const amount = parseFloat(transactionAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Monto inválido');
        return;
      }
      
      await cashRegisterApi.registerTransaction({
        type: transactionType,
        amount,
        method: transactionMethod,
        description: transactionDescription
      });
      
      toast.success('Transacción registrada correctamente');
      
      // Reset form
      setTransactionAmount('');
      setTransactionDescription('');
      setTransactionType('sale');
      setTransactionMethod('cash');
      setIsAddTransactionOpen(false);
      
      // Recargar datos
      await loadDailyData();
    } catch (error: any) {
      console.error('Error registering transaction:', error);
      toast.error(error.message || 'Error al registrar la transacción');
    }
  };
  
  const handleCloseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!countedCash) {
      toast.error('Por favor ingrese el monto contado en caja');
      return;
    }
    
    try {
      const countedCashAmount = parseFloat(countedCash);
      const tomorrowBalance = parseFloat(tomorrowOpeningBalance);
      
      if (isNaN(countedCashAmount) || countedCashAmount < 0) {
        toast.error('Monto contado inválido');
        return;
      }
      
      if (isNaN(tomorrowBalance) || tomorrowBalance < 0) {
        toast.error('Saldo inicial inválido');
        return;
      }
      
      const actualCashDifference = countedCashAmount - (summary?.currentCashBalance || 0);
      
      await cashRegisterApi.closeCashRegister({
        countedCash: countedCashAmount,
        openingBalanceTomorrow: tomorrowBalance,
        notes: closingNotes,
        actualCashDifference
      });
      
      toast.success('Caja cerrada correctamente');
      setIsCloseRegisterOpen(false);
      setCountedCash('');
      setClosingNotes('');
      
      // Recargar datos
      await loadDailyData();
    } catch (error: any) {
      console.error('Error closing register:', error);
      toast.error(error.message || 'Error al cerrar la caja');
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Caja
            </h1>
            <p className="text-sm sm:text-base ">
              {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: es })}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={loadDailyData}
              className="w-full sm:w-auto justify-center"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            
            <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Transacción
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Nueva Transacción</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTransaction} className="space-y-4 px-1">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Tipo de transacción</Label>
                    <Select value={transactionType} onValueChange={(v) => setTransactionType(v as typeof transactionType)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Venta</SelectItem>
                        <SelectItem value="deposit">Adelanto de pedido</SelectItem>
                        <SelectItem value="expense">Gasto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-sm">Monto (Bs.)</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      required 
                      className="text-sm"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-sm">Método de pago</Label>
                    <Select value={transactionMethod} onValueChange={(v) => setTransactionMethod(v as 'cash' | 'qr')}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="qr">QR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-sm">Descripción</Label>
                    <Textarea 
                      placeholder="Descripción de la transacción..." 
                      required 
                      className="text-sm" 
                      rows={3}
                      value={transactionDescription}
                      onChange={(e) => setTransactionDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddTransactionOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
                      Cancelar
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
                      Registrar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {isOpen && (
              <Dialog open={isCloseRegisterOpen} onOpenChange={setIsCloseRegisterOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto justify-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Cerrar Caja
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Cerrar Caja del Día</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCloseRegister} className="space-y-4 px-1">
                    <div className="p-3 sm:p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Saldo inicial:</span>
                        <span className="font-medium">Bs. {summary.openingBalance}</span>
                      </div>
                      {summary.totalIncome >= 0 ? (
                        <div className="flex justify-between text-green-600">
                          <span>+ Ingresos:</span>
                          <span className="font-medium">Bs. {summary.totalIncome}</span>
                        </div>
                      ):(
                        <div className="flex justify-between text-red-600">
                          <span>Ingresos:</span>
                          <span className="font-medium">Bs. {summary.totalIncome}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total esperado en efectivo:</span>
                        <span>Bs. {summary.currentCashBalance ?? 0}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">Monto contado en caja (Bs.)</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        required 
                        className="text-sm"
                        value={countedCash}
                        onChange={(e) => setCountedCash(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">Saldo inicial para mañana (Bs.)</Label>
                      <Input 
                        type="number" 
                        placeholder="500" 
                        required 
                        className="text-sm"
                        value={tomorrowOpeningBalance}
                        onChange={(e) => setTomorrowOpeningBalance(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">Notas (opcional)</Label>
                      <Textarea 
                        placeholder="Observaciones del cierre..." 
                        className="text-sm" 
                        rows={3}
                        value={closingNotes}
                        onChange={(e) => setClosingNotes(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsCloseRegisterOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
                        Cancelar
                      </Button>
                      <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
                        Confirmar Cierre
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 px-4 sm:px-0">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="p-1.5 sm:p-2 bg-green-100 text-green-800 rounded-lg">
                  <Banknote className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <Badge variant="outline" className="text-xs">Efectivo</Badge>
              </div>
              <p className="text-lg sm:text-2xl font-bold mt-2 sm:mt-3">Bs. {summary?.currentCashBalance ?? 0}</p>
              <p className="text-xs sm:text-sm ">En caja</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="p-1.5 sm:p-2 bg-purple-100 text-purple-800 rounded-lg">
                  <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <Badge variant="outline" className="text-xs">Digital</Badge>
              </div>
              <p className="text-lg sm:text-2xl font-bold mt-2 sm:mt-3">Bs. {summary?.currentQrBalance ?? 0}</p>
              <p className="text-xs sm:text-sm ">Pagos QR</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="p-1.5 sm:p-2 bg-blue-100 text-blue-800 rounded-lg">
                  <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              {summary?.totalIncome >= 0 ? (
                <p className="text-lg sm:text-2xl font-bold mt-2 sm:mt-3 text-green-600">+Bs. {summary?.totalIncome ?? 0}</p>
              ):(
                <p className="text-lg sm:text-2xl font-bold mt-2 sm:mt-3 text-red-600">Bs. {summary?.totalIncome ?? 0}</p>
              )}
              <p className="text-xs sm:text-sm ">Ingresos del día</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="p-1.5 sm:p-2 bg-red-100 text-red-800 rounded-lg">
                  <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold mt-2 sm:mt-3 text-red-600">-Bs. {summary?.totalExpenses ?? 0}</p>
              <p className="text-xs sm:text-sm ">Gastos del día</p>
            </CardContent>
          </Card>
        </div>

        {/* Opening Balance */}
        <Card className="mx-4 sm:mx-0">
          <CardContent className="p-3 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm ">Saldo de apertura</p>
              <p className="text-base sm:text-xl font-bold">Bs. {summary?.openingBalance ?? 0}</p>
            </div>
            <Badge variant={isOpen ? 'default' : 'secondary'} className="text-xs sm:text-sm">
              {isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
            </Badge>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader className="px-4 py-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Movimientos del Día</CardTitle>
          </CardHeader>
          {!loading ? (

            <CardContent className="px-4 pb-4 sm:px-6">
              {isMobile ? (
                <div className="space-y-3">
                  {summary.transactions.map(transaction => (
                    <MobileCard key={transaction.id} className="overflow-hidden">
                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${
                              transaction.type === 'sale' ? 'bg-green-100' :
                              transaction.type === 'deposit' ? 'bg-blue-100' :
                              'bg-red-100'
                            }`}>
                              {transaction.method === 'cash' ? (
                                <Banknote className="h-4 w-4" />
                              ) : (
                                <QrCode className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm truncate max-w-[150px]">{transaction.description}</p>
                              <p className="text-xs ">
                                {format(transaction.createdAt, 'HH:mm')}
                              </p>
                            </div>
                          </div>
                          <p className={`font-bold text-sm ${
                            transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'sale' ? '+' : ''}Bs. {Math.abs(transaction.amount)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-1 border-t">
                          <Badge variant={
                            transaction.type === 'sale' ? 'default' :
                            transaction.type === 'deposit' ? 'secondary' :
                            'destructive'
                          } className="text-xs">
                            {transaction.type === 'sale' ? 'Venta' :
                            transaction.type === 'deposit' ? 'Adelanto' :
                            'Gasto'}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs ">
                            {transaction.method === 'cash' ? (
                              <Banknote className="h-3 w-3" />
                            ) : (
                              <QrCode className="h-3 w-3" />
                            )}
                            <span>{transaction.method === 'cash' ? 'Efectivo' : 'QR'}</span>
                          </div>
                        </div>
                      </div>
                    </MobileCard>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Hora</TableHead>
                        <TableHead className="whitespace-nowrap">Tipo</TableHead>
                        <TableHead className="whitespace-nowrap">Descripción</TableHead>
                        <TableHead className="whitespace-nowrap">Método</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.transactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell className=" whitespace-nowrap">
                            {format(transaction.createdAt, 'HH:mm')}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={
                              transaction.type === 'sale' ? 'default' :
                              transaction.type === 'deposit' ? 'secondary' :
                              transaction.type === 'expense' ? 'destructive' : 'outline'
                            }>
                              {transaction.type === 'sale' ? 'Venta' :
                              transaction.type === 'deposit' ? 'Adelanto' :
                              transaction.type === 'expense' ? 'Gasto' : 'Ajuste'}
                            </Badge>
                          </TableCell>
                          <TableCell className="min-w-[200px]">{transaction.description}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {transaction.method === 'cash' ? (
                                <Banknote className="h-4 w-4" />
                              ) : (
                                <QrCode className="h-4 w-4" />
                              )}
                              <span className="text-sm">
                                {transaction.method === 'cash' ? 'Efectivo' : 'QR'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className={`text-right font-medium whitespace-nowrap ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                            {transaction.type === 'sale' ? '+' : ''}Bs. {Math.abs(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          ):(
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}