from abc import ABC, abstractmethod

class Usuario(ABC):

    def __init__(self, id, nombre, correo, cargo, estado, contraseña, telefono):
        
        self.id = id
        self.nombre = nombre
        self.correo = correo
        self.cargo = cargo
        self.estado = estado
        self.contraseña = contraseña
        self.telefono = telefono