# language: es
Característica: Citas del cliente

  Escenario: Un cliente revisa sus próximas reservas
    Dado que existen reservas demo para la cuenta cliente
    Cuando inicio sesión como cliente
    Y abro la sección Mis citas
    Entonces puedo consultar los servicios y estados reservados
    Cuando intento abrir una ruta profesional
    Entonces sigo en las pantallas permitidas para cliente
    Cuando cierro y vuelvo a abrir la aplicación sin borrar datos
    Entonces conservo mi sesión y las citas guardadas
