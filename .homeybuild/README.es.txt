Bienvenido a la Biblioteca Better Logic.

Una biblioteca de lógica avanzada con gestión de variables y bibliotecas para Homey.

Esta aplicación proporciona a tu Homey Better Logic y Bibliotecas:
* Gestión de variables de una manera inteligente e integrada.
* Tarjetas de acción y condición avanzadas con Better Logic, como Math.js.
* Dispositivos para gestionar directamente las variables.
* Formateo de fecha y hora, completamente personalizable, compartido con otras aplicaciones.
* Codificación BLL y expresiones BLL para usar directamente dentro de otras tarjetas de flujo de aplicaciones.
* Funciones personalizadas para usar dentro de la codificación BLL y las expresiones BLL.
* Bibliotecas para usar dentro de la codificación BLL y las expresiones BLL, como Math.js y Lodash.
* Un Servidor de Archivos que puede ser consumido por otras aplicaciones, como Simple (Sys) LOG, para servir archivos en tu LAN o descargarlos en la App Móvil de Homey o las Herramientas de Desarrollo.
* Bibliotecas para que otras Aplicaciones las consuman, reduciendo el tamaño de las apps y redundancias y mejorando la gestión.
* APIs para la gestión de variables, usando el Servidor de Archivos u otras funciones BLL.
* Tarjetas de flujo para convertir un objeto/arreglo JSON a CSV o Excel.

¡Consulta los Ajustes de la App (nuevos) para ver todas las características y explicaciones, como la codificación BLL en las aplicaciones compatibles!

Ejemplo de codificación BLL: Cuando pones esto dentro de un argumento de texto: - Hola, hoy es {[date("dddd")]} -, BLL encontrará automáticamente esas expresiones dentro de los textos y las decodificará, resultando en - Hola, hoy es lunes -.

Además: ¡Gestiona variables directamente en los flujos!

Simplemente escribe un nombre de variable dentro de cualquier tarjeta cuando- y después de- y selecciónala de la lista: la variable será creada automáticamente.
Si quieres usar la etiqueta, presiona guardar primero.
Las variables creadas automáticamente desde los flujos también serán eliminadas automáticamente cuando ya no se usen en tarjetas de flujo.
Las variables también pueden seguir gestionándose desde la pantalla de ajustes. Estas variables no se eliminarán automáticamente si no se usan, sino que deben eliminarse manualmente.

Función: Añadir $timenow$ como una variable especial para mathjs. Esto recuperará el tiempo actual en segundos desde la época. Esta variable no se almacena en el resumen, pero se usa en expresiones.
Función: Se añadieron #DD (día), #MM (mes), #YYYY (año), #HH (horas), #mm (minutos) #SS (segundos) como palabras reservadas junto a timenow en los flujos de mathjs. Ahora puedes, por ejemplo, asignar #HH a una variable para obtener las horas. También cambié timenow a #timenow por consistencia.

¡Consulta el foro de la comunidad para más información!