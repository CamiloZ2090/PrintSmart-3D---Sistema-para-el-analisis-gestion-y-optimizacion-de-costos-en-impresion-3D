from Usuario import Usuario

class Administrador(Usuario):

    def __init__(self, id, nombre, correo, cargo, estado, contraseña, telefono):
        super().__init__(id, nombre, correo, cargo, estado, contraseña, telefono)

    def gestionarUsuarios(self):
        return None

    def gestionarRoles(self):
        return None

    def gestionarPedidos(self):
        return None

    def gestionarReportes(self):
        return None
