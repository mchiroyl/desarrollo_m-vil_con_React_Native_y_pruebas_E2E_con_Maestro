# language: es
Característica: Reservas de servicios

  Escenario: Una persona crea su cuenta y reserva con un profesional
    Dado que la aplicación inicia sin datos locales
    Cuando registro una cuenta de cliente
    Y exploro barberías y selecciono un servicio disponible
    Y reviso y acepto la confirmación de la reserva
    Entonces la cita aparece en mis citas
