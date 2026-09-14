Bienvenido a la Biblioteca de Mejor Lógica.

Una biblioteca de lógica avanzada con gestión de variables y bibliotecas para Homey.

Esta aplicación proporciona a tu Homey Mejor Lógica y Bibliotecas:
* Gestión de variables de una manera inteligente e integrada.
* Tarjetas de acción y condición avanzadas con Mejor Lógica, como Math.js.
* Dispositivos para gestionar directamente las variables.
* Formateo de fecha y hora, totalmente personalizable, compartido con otras aplicaciones.
* Codificación BLL y expresiones BLL para usar directamente dentro de otras tarjetas de flujo de aplicaciones.
* Funciones personalizadas para usar dentro de la codificación BLL y las expresiones BLL.
* Bibliotecas para usar dentro de la codificación BLL y las expresiones BLL, como Math.js y Lodash.
* Un Servidor de Archivos que puede ser consumido por otras aplicaciones, como Simple (Sys) LOG, para servir archivos en tu LAN o para descargarlos en la App Móvil de Homey o las Herramientas de Desarrollo.
* Bibliotecas para que otras Apps las consuman, reduciendo el tamaño de las aplicaciones y redundancias y mejorando la gestión.
* APIs para la gestión de variables, usando el Servidor de Archivos u otras funciones de BLL.

Consulta la (nueva) Configuración de la App para todas las funciones y explicaciones, ¡como la codificación BLL en aplicaciones compatibles!

Ejemplo de codificación BLL: Cuando colocas esto dentro de un argumento de texto: - Hola, hoy es {[date("dddd")]} -, BLL encontrará automáticamente esas expresiones dentro de los textos y las decodificará, resultando en - Hola, hoy es lunes - .

Además: ¡Gestiona variables directamente en los flujos!

Sólo escribe un nombre de variable dentro de cualquier tarjeta when o then y selecciónala de la lista: la variable se creará automáticamente.
Si deseas usar la etiqueta, presiona guardar primero.
Las variables que se crearon automáticamente desde los flujos también se eliminarán automáticamente cuando ya no se utilicen en las tarjetas de flujo.
Las variables también se pueden seguir gestionando desde la pantalla de configuración. Estas variables no se eliminarán automáticamente si no se utilizan, sino que deben eliminarse manualmente.

¡Y el botón Eliminar Todo ahora tiene una confirmación!

* Característica: Añadido soporte de API para GET, obtener todas las variables y SET (post) un valor.
	* GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME
	* GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/ALL (Obtener todas las variables)
	* PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/VALUE  //Asegúrate de que el valor coincida con el tipo, de lo contrario no se establecerá.
* Característica: Activar a través de la API. Llamada
	* PUT para incremento: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/trigger/VARIABLENAME Esto activa la variable dada
* Característica: Añadir incremento o decremento a la API. Llamada
	* PUT para incremento: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/i/VALUE  Incrementa la variable con el valor dado
	* PUT para decremento: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/d/VALUE  Decrementa la variable con el valor dado
* Característica: Añadir alternancia de booleanos (true->false o false->true) al soporte de la API
    * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/toggle Esto forzará a cambiar el valor booleano

* Característica: Añadir $timenow$ como una variable especial para mathjs. Esto recuperará la hora actual en segundos desde el epoch. Esta variable no se almacena en la vista general, pero se usa en expresiones.
* Característica: Añadido #DD (día), #MM (mes), #YYYY (año), #HH (horas), #mm (minutos) #SS (segundos) como palabras reservadas junto a timenow en los flujos de mathjs. Ahora puedes, por ejemplo, asignar #HH a una variable para obtener las horas. También cambié timenow a #timenow por coherencia.