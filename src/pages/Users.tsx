import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MobileCard, MobileCardHeader, useIsMobile } from '@/components/ui/responsive-table';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Shield,
  Power,
  PowerOff,
  UserCheck,
  Loader2
} from 'lucide-react';
import { CreateUser, User, UserRole } from '@/types';
import { toast } from 'sonner';
import { roleColors, roleLabels } from '@/types/consts';
import { IUsersApi, defaultUsersApi } from '@/api/UsersApi';

interface UsersProps {
  api?: IUsersApi;
}

export default function Users({ api = defaultUsersApi }: UsersProps) {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [togglingUser, setTogglingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });

  // Cargar usuarios
  useEffect(() => {
    loadUsers();
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers(searchTerm);
      setUsers(data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const resetForm = () => {
    setFormData({ name: '', username: '', password: '' });
    setSelectedRoles([]);
    setEditingUser(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: ''
    });
    setSelectedRoles(user.roles);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openToggleStatusDialog = (user: User) => {
    setTogglingUser(user);
    setIsToggleStatusDialogOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!togglingUser) return;
    
    try {
      setSubmitting(true);
      await api.toggleUserStatus(togglingUser.id);
      
      const newStatus = !togglingUser.isActive;
      toast.success(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
      
      setIsToggleStatusDialogOpen(false);
      setTogglingUser(null);
      await loadUsers(); // Recargar datos
    } catch (error) {
      toast.error('Error al cambiar estado del usuario');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      if (editingUser) {
        const updateData: Partial<CreateUser> = {
          name: formData.name,
          username: formData.username,
          roles: selectedRoles,
          ...(formData.password && { password: formData.password })
        };
        
        await api.editUser(editingUser.id, updateData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        const newUser: CreateUser = {
          name: formData.name,
          username: formData.username,
          password: formData.password,
          roles: selectedRoles
        };
        
        await api.createUser(newUser);
        toast.success('Usuario creado exitosamente');
      }
      
      setIsDialogOpen(false);
      resetForm();
      await loadUsers(); // Recargar datos
    } catch (error) {
      toast.error(editingUser ? 'Error al actualizar usuario' : 'Error al crear usuario');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    
    try {
      setSubmitting(true);
      await api.deleteUser(deletingUser.id);
      
      toast.success('Usuario eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
      await loadUsers(); // Recargar datos
    } catch (error) {
      toast.error('Error al eliminar usuario');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Usuarios</h1>
            <p className="text-muted-foreground">Gestión de usuarios y roles</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Dialog para Crear/Editar Usuario */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre completo *</Label>
                <Input 
                  placeholder="Nombre del usuario" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required 
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre de usuario *</Label>
                <Input 
                  type="text" 
                  placeholder="gary.mamani" 
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required 
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Contraseña {!editingUser && '*'}
                  {editingUser && <span className="text-xs text-muted-foreground ml-2">(Dejar vacío para mantener la actual)</span>}
                </Label>
                <Input 
                  type="password" 
                  placeholder={editingUser ? "Nueva contraseña (opcional)" : "Contraseña segura"} 
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required={!editingUser}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Roles *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(roleLabels) as UserRole[]).map(role => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox 
                        id={role} 
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={() => toggleRole(role)}
                        disabled={submitting}
                      />
                      <label htmlFor={role} className="text-sm cursor-pointer">
                        {roleLabels[role]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleDialogClose(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={selectedRoles.length === 0 || submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingUser ? 'Actualizar' : 'Crear'} Usuario
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para Activar/Desactivar Usuario */}
        <Dialog open={isToggleStatusDialogOpen} onOpenChange={setIsToggleStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {togglingUser?.isActive ? 'Desactivar' : 'Activar'} Usuario
              </DialogTitle>
              <DialogDescription>
                {togglingUser?.isActive 
                  ? '¿Estás seguro de que deseas desactivar este usuario? No podrá acceder al sistema hasta que sea activado nuevamente.'
                  : '¿Estás seguro de que deseas activar este usuario? Podrá acceder al sistema nuevamente.'
                }
              </DialogDescription>
            </DialogHeader>
            {togglingUser && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarFallback className={`${togglingUser.isActive ? 'bg-primary' : 'bg-muted-foreground'} text-primary-foreground`}>
                        {getInitials(togglingUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{togglingUser.name}</p>
                      <p className="text-sm text-muted-foreground">{togglingUser.username}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {togglingUser.roles.map(role => (
                      <Badge key={role} className={roleColors[role]}>
                        {roleLabels[role]}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Badge variant={togglingUser.isActive ? "default" : "secondary"}>
                      {togglingUser.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsToggleStatusDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant={togglingUser.isActive ? "destructive" : "default"}
                    onClick={handleToggleStatus}
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {togglingUser.isActive 
                      ? <><PowerOff className="h-4 w-4 mr-2" /> Desactivar</>
                      : <><Power className="h-4 w-4 mr-2" /> Activar</>
                    } Usuario
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para Eliminar Usuario */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar Usuario</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            {deletingUser && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarFallback className={`${deletingUser.isActive ? 'bg-primary' : 'bg-muted-foreground'} text-primary-foreground`}>
                        {getInitials(deletingUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{deletingUser.name}</p>
                      <p className="text-sm text-muted-foreground">{deletingUser.username}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {deletingUser.roles.map(role => (
                      <Badge key={role} className={roleColors[role]}>
                        {roleLabels[role]}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Usuario
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-800 rounded-lg">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Usuarios activos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-800 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.roles.includes('admin')).length}
                </p>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar usuarios..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {!loading && filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No se encontraron usuarios
            </CardContent>
          </Card>
        )}

        {!loading && filteredUsers.length > 0 && (
          <>
            {isMobile ? (
              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <MobileCard key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
                    <MobileCardHeader>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="flex-shrink-0">
                          <AvatarFallback className={`${user.isActive ? 'bg-primary' : 'bg-muted-foreground'} text-primary-foreground`}>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium flex items-center gap-2 truncate">
                            {user.name}
                            {!user.isActive && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">Inactivo</Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{user.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openToggleStatusDialog(user)}
                          title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                          disabled={submitting}
                        >
                          {user.isActive 
                            ? <PowerOff className="h-4 w-4 text-yellow-600" />
                            : <Power className="h-4 w-4 text-green-600" />
                          }
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(user)}
                          disabled={submitting}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openDeleteDialog(user)}
                          disabled={user.roles.includes('admin') || submitting}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </MobileCardHeader>
                    
                    <div className="flex flex-wrap gap-1 pt-2">
                      {user.roles.map(role => (
                        <Badge key={role} className={roleColors[role]}>
                          {roleLabels[role]}
                        </Badge>
                      ))}
                    </div>
                  </MobileCard>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Nombre de usuario</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(user => (
                        <TableRow key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className={`${user.isActive ? 'bg-primary' : 'bg-muted-foreground'} text-primary-foreground`}>
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.username}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map(role => (
                                <Badge key={role} className={roleColors[role]}>
                                  {roleLabels[role]}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openToggleStatusDialog(user)}
                              title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                              disabled={submitting}
                            >
                              {user.isActive 
                                ? <PowerOff className="h-4 w-4 text-yellow-600" />
                                : <Power className="h-4 w-4 text-green-600" />
                              }
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditDialog(user)}
                              disabled={submitting}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openDeleteDialog(user)}
                              disabled={user.roles.includes('admin') || submitting}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}