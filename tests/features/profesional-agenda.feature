# language: es
Característica: Agenda profesional

  Escenario: Un profesional consulta el detalle de una cita
    Dado que existen citas demo en la base local
    Cuando inicio sesión como profesional
    Y abro una cita de mi agenda
    Entonces puedo revisar los datos y decidir su estado
    Cuando confirmo la cita y acepto la confirmación
    Entonces la cita queda confirmada
    Cuando cancelo la cita confirmada y acepto la confirmación
    Entonces la cita queda cancelada
