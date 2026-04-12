import { useState } from 'react';
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
  Users as UsersIcon, 
  Shield,
  Power,
  PowerOff,
  UserCheck,
  UserX
} from 'lucide-react';
import { CreateUser, User, UserRole } from '@/types';
import { mockUsers } from '@/data/mockData';
import { toast } from 'sonner';
import { roleColors, roleLabels } from '@/types/consts';

export default function Users() {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<User[]>(mockUsers.map(user => ({ ...user, isActive: true })));
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [togglingUser, setTogglingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      password: '' // No mostramos la contraseña actual
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

  const handleToggleStatus = () => {
    if (togglingUser) {
      const newStatus = !togglingUser.isActive;
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === togglingUser.id 
            ? { ...u, isActive: newStatus }
            : u
        )
      );
      toast.success(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
      setIsToggleStatusDialogOpen(false);
      setTogglingUser(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === editingUser.id 
            ? {
                ...u,
                name: formData.name,
                username: formData.username,
                roles: selectedRoles,
                ...(formData.password && { password: formData.password })
              }
            : u
        )
      );
      toast.success('Usuario actualizado exitosamente');
    } else {
      const newUser: CreateUser = {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        roles: selectedRoles
      };
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name,
        username: newUser.username,
        roles: newUser.roles,
        isActive: true // Por defecto, el usuario se crea activo
      }
      setUsers(prev => [...prev, user]);
      toast.success('Usuario creado exitosamente');
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deletingUser) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== deletingUser.id));
      toast.success('Usuario eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
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
                      />
                      <label htmlFor={role} className="text-sm cursor-pointer">
                        {roleLabels[role]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={selectedRoles.length === 0}>
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
                  <Button variant="outline" onClick={() => setIsToggleStatusDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    variant={togglingUser.isActive ? "destructive" : "default"}
                    onClick={handleToggleStatus}
                  >
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
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
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

        {/* Users Table / Mobile Cards */}
        {isMobile ? (
          <div className="space-y-3">
            {filteredUsers.map(user => (
              <MobileCard key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
                <MobileCardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className={`${user.isActive ? 'bg-primary' : 'bg-muted-foreground'} text-primary-foreground`}>
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {user.name}
                        {!user.isActive && (
                          <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openToggleStatusDialog(user)}
                      title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      {user.isActive 
                        ? <PowerOff className="h-4 w-4 text-yellow-600" />
                        : <Power className="h-4 w-4 text-green-600" />
                      }
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openDeleteDialog(user)}
                      disabled={user.roles.includes('admin')}
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
                        >
                          {user.isActive 
                            ? <PowerOff className="h-4 w-4 text-yellow-600" />
                            : <Power className="h-4 w-4 text-green-600" />
                          }
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openDeleteDialog(user)}
                          disabled={user.roles.includes('admin')}
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
      </div>
    </MainLayout>
  );
}
