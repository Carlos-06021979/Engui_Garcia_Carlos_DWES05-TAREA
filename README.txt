Engui_Garcia_Carlos_DWES05-TAREA

Tarea basada en lo más fiel posible al juego del ajedrez.
Está desarrollado en su gran mayoría en PHP (con programación Orientada a Objetos),
HTML, CSS y un archivo de JavaScript (script.js) para las funcionalidades extras a 
lo que pide el enunciado de la tarea que no he podido hacer correctamente con PHP.

Es un motor de ajedrez lo más completo posible.

-----------------------------------------------
Pantalla inicial "Configuración de partida":
-----------------------------------------------
  -En la sección "¿Deseas continuar con una partida anterior?"
    -Si hay una/s partida/s guardada/s, primero te da la opción de poder reanudarlas:
      -Si no las hemos renombrado anteriormente al guardar, su/s nombre/s por defecto serán 
       Nombre_jugador_blancas vs Nombre_jugador_negras - dd/mm/YYYY hh:mm

  -En la sección "Configuración de los jugadores" podremos:
      -Configurar el nombre da cada jugador (en el caso de no poner un nombre, por defecto 
       será jugador 1 y jugador 2 para las blancas y las negras respectivamente).

      -Podremos asignar un avatar a cada jugador siendo las posibilidades:
        -Sin avatar (lo que saldrá una esfera de su color).
        -Cualquier ficha del tablero de su color (torre, caballo, alfil, dama, rey o peón).
        -Un "relieve/busto de perfil de usuario" del color de las fichas con la que juega cada uno (Usuario).
        -Uno de los gifs predeterminados:
            -Alfil que cambia de color
            -Un fragmento de una partida de Anand contra Kasparov
            -Un agradable anciano jugando al ajedrez en un parque (sacado de un corto)
            -Bart Simpson jugando una multi-partida
            -Una animación de como una ficha de ajedrez pega un sillazo a una ficha oponente
            -Un gato moviendo una ficha

        -Una imagen de cada uno de los campeones de ajedrez (por si quieres sentirte en la piel de un campeón):
            -Magnus Carlsen
            -Garry Kasparov
            -Bobby Fischer 
            -Antoly Karpov
            -Viswanathan Anand
            -Judit Polgar

        -Una imagen o gif personalizado (formatos PNG, JPG o GIF y de máximo 5MB) pudiendo seleccionarla
         desde el explorador de archivos su sistema operativo (seleccionando la opción "Imagen o GIF personalizado" 
         del desplegable y clicando posteriormente en el botón "Elegir imagen"). Se puede 
         ver una previsualización de dicha imagen antes de comenzar la partida y posteriormente se 
         visualizará en los relojes de cada jugador durante la partida.
    
  -En la sección "Configuración del tiempo" podremos:
      -Seleccionar los distintos tiempos iniciales por jugador que nos ofrece:
        -Sin tiempo (partida sin límite) para que, si se acaba la partida, no sea culpa del tiempo
        -Partida ultra-rápida de 1 minuto (Bullet en términos de ajedrez).
        -Partida rápida de 3 o 5 minutos (Blitz en términos de ajedrez).
        -Partida clásica de 30 min (que es la que está por defecto si no 
         seleccionamos ninguna) o de 60 minutos. Cuando el tiempo sea menos de 1 minuto,
         el reloj parpadeará como alerta de tiempo crítico.

      -Seleccionar un incremento de 1, 2, 3, 5 o 10 segundos extra al reloj del jugador después 
       de cada movimiento (regla de Bobby Fischer, campeón mundial de ajedrez) para que no se 
       acabe la partida sólo por falta de tiempo en posiciones complicadas. Por defecto está sin incremento

  -En la sección "Configuración de interfaz" podremos:
      -Mostrar u ocultar las coordenadas (A-H, 1-8).
      -Mostrar u ocultar la piezas capturadas.

  - Pulsando el botón "Iniciar Partida Nueva" iniciaremos el juego. Mucha suerte!!!


-----------------------------------------------
Pantalla de partida/juego "Partida de Ajedrez":
-----------------------------------------------
  -Empezando de arriba hacia abajo tenemos:
    -Icono representativo de un peón con el literal Partida de Ajedrez como título, botón de ajustes con:
      -Las opciones de interfaz para mostrar u ocultar tanto las coordenadas del tablero (A-H, 1-8)
       como el panel de piezas capturadas (estas 2 configuraciones se aplicarán en tiempo real)

      -Información del tiempo:
        -Tiempo inicial
        -Incremento Fischer
        -Informa que estos 2 ultimos no se pueden cambiar durante la partida (sólo se podrá en la 
         configuración al realizar al comienzo de una nueva partida)
        -Botón de guardar los cambios (si hemos hecho alguno, si no se mantendrá deshabilitado)
        -Botón de Cancelar para salir del modal
        -La partida se mantendrá pausada mientras tomemos decisiones y no cerremos el modal
        -Configuración persistente entre sesiones

      -Botón de pause/play donde podremos pausar o reanudar la partida (cuando la partida esté pausada, 
    se habilitará el botón de "Guardar partida". También se auto-pausará cuando estemos tomando 
    decisiones (como por ejemplo en una ventana modal y se reanudará al salir de ella y volver a la partida))

    -Contenedor de información e iteracción con el/los usuario/s - jugador/es que te mantiene siempre informado:
      - TURNO ACTUAL: Te indica claramente quién debe mover en cada momento con mensajes como 
        "Turno de Blancas" o "Turno de Negras"
      - ESTADO DE LA PARTIDA: 
        · PAUSA: Si la partida está pausada, verás un mensaje indicándolo para que sepas que 
          el tiempo no está corriendo
        · JAQUE: Cuando tu rey está bajo amenaza, recibirás una advertencia clara avisándote de que 
          estás en jaque y tienes que hacer un movimiento legal para salir de esa situación
        · JAQUE MATE: Se detecta automáticamente y te avisa de que la partida ha terminado, mostrando 
          quién ha ganado y por qué
      - ERRORES DE MOVIMIENTO: Si intentas un movimiento ilegal, el sistema te lo comunica indicando 
        qué está mal (ej. "No puedes dejar a tu rey en jaque", "Pieza bloqueada", etc.)
      - PROMOCIÓN DE PEÓN: Cuando llega un peón a la parte contraria, el usuario/jugador puede elegir 
        por cuál ficha promocionar (una Dama, una Torre, un Alfil o un Caballo)
      - FIN DE PARTIDA: Al terminar la partida, se informa claramente:
        · Quién ha ganado (Blancas o Negras)
        · POR QUÉ ha ganado (Jaque mate, tiempo agotado, rendición, tablas, etc.)
        · Puntuación final de cada jugador

    -Contadores de tiempo restante de cada jugador, sus avatares (si los tuvieran), nombres y puntuación 
     En principio empiezan por cero puntos y van sumando conforme vayan capturando piezas del contrario:
      - Dama = 9 pts
      - Torre = 5 pts
      - Alfil = 3 pts
      - Caballo = 3 pts
      - Peón = 1 pt
      - Rey = 0 pts
      
    -OPCIÓN DE JUEGO SIN TIEMPO: Si no deseas tener presión de tiempo, puedes jugar una partida sin limite 
     temporal. El reloj mostrará infinito (∞) en lugar de ir contando hacia atrás. Perfecto para disfrutar 
     del ajedrez sin estrés.

    -Tablero de juego (8x8) con patrón ajedrezado, con las fichas de ambos jugadores, marco de coordenadas 
     (A-H, 1-8) opcionales, indicadores visuales de movimientos posibles:
       -Resaltado amarillo de casilla seleccionada
       -Círculos verdes para movimientos válidos
       -Borde rojo pulsante para capturas
     y paneles laterales de fichas capturadas del oponente de cada jugador

    -Fila de botones con las siguientes funciones:
      -Botón de deshacer movimiento/s (hasta 10 movimientos)
      -Botón de revancha para volver a hacer una partida con la misma configuración de jugadores, tiempo y vista
      -Botón para guardar una partida y así poder reanudarla posteriormente cuando se desee:
        -Se abre un modal de guardado donde:
          · Puedes MODIFICAR EL NOMBRE de la partida guardada (viene con un nombre por defecto tipo 
            "Jugador_1 vs Jugador_2 - 20/01/2026 20:08", pero puedes cambiar el nombre a lo que quieras)
          · Se almacena en formato JSON con el estado completo de piezas, tiempo, turno e historial
        -Sólo estará disponible cuando pongamos la partida en pausa
      -Botón de nueva partida para comenzar una nueva partida (con ventana modal de conformación por si hemos 
       clicado sin querer dicho botón y así evitar errores y sustos y más si ibas a ganar 😜)
      
    -Desplegable de historial de movimientos en formato algebraico de cada jugador

    -Desplegable de reglas y controles del juego

  -Detección de piezas bloqueando caminos
  -Validación de capturas (no puedes capturar tus propias piezas)
  -Control de turnos alternados
  -Detección de movimientos ilegales
  -Cuando se acabe el tiempo de alguno de los jugadores, se acabará la partida y se 
   informará de quien ha perdido y quien ha ganado



-----------------------------------------------
Gestión de partidas guardadas:
-----------------------------------------------
Dentro de la pantalla de configuración inicial, tienes una sección especial para gestionar tus 
partidas guardadas, donde puedes:

  CARGAR UNA PARTIDA:
    1-. Haz clic en "📁 Cargar Partida Guardada"
    2-. Se abre un modal con todas tus partidas guardadas
    3-. Tienes varias opciones para encontrar la partida que buscas:
        -BÚSQUEDA: Escribe parte del nombre de la partida (o la fecha) en el campo de búsqueda
         y el sistema filtrará automáticamente mostrando sólo las que coincidan.
        -LIMPIAR FILTRO: Haz clic en la "X" que aparece en el campo cuando escribes algo.
        -ORDENAMIENTO:
          · 🕒 BOTÓN DE FECHA: Pulsa para cambiar entre "Recientes" (más nuevas primero) 
            o "Antiguas" (más viejas primero).
          · 🔤 BOTÓN ALFABÉTICO: Pulsa para cambiar entre "A-Z" o "Z-A" alfabético del nombre.
           Solo uno de los botones puede estar activo a la vez, así sabes qué tipo de 
           ordenamiento estás usando.
    4-. Una vez encuentres tu partida, haz clic en "📂 Cargar" para reanudarla.

  ELIMINAR PARTIDAS:
    -ELIMINAR UNA POR UNA: Junto a cada partida hay un botón "🗑️" rojo. Al hacer clic, 
     aparecerá una ventana pidiendo confirmación para asegurar que no lo haces por error.
    
    -ELIMINAR TODAS DE GOLPE: Si no necesitas ninguna de tus partidas, pulsa el botón 
     "🗑️ Eliminar todas" (también te pedirá confirmación). Esto elimina todas tus partidas 
     guardadas en un solo click (¡ojo, es definitivo!).

    -Las partidas se eliminan sin salir del modal, así que después de eliminar puedes seguir 
     navegando tus partidas o cargar una que te hayas dejado.



-----------------------------------------------
Reglas avanzadas:
-----------------------------------------------

- JAQUE: Detecta cuando el rey está amenazado

- JAQUE MATE: Detecta cuando no hay movimientos legales para salir del jaque

- TABLAS (EMPATE):
  -Stalemate (ahogado): el jugador al que le toca mover no está en jaque, pero no tiene ningún movimiento legal
  - Material insuficiente: se declara tablas cuando sólo hay reyes, o rey + alfil vs rey, o rey + caballo vs rey
  - No estoy muy seguro que funcione perfectamente

- PROMOCIÓN DE PEÓN:
   - Al llegar al extremo opuesto se abre un modal
   - Elección de pieza: Dama, Torre, Alfil o Caballo
   - La partida se pausa hasta confirmar la promoción

- ENROQUE:
   - Implementado con confirmación del jugador vía modal
   - Para iniciar: mueve el rey 2 casillas (E→G para corto, E→C para largo)
   - Si las condiciones se cumplen, aparece un modal preguntando si deseas ejecutar el enroque
   - Puedes confirmar o cancelar (si cancelas, el rey no se mueve y conservas la opción)
   - Validación completa: piezas sin mover, casillas libres y sin jaque intermedio

- CAPTURA AL PASO:
   - Implementada: disponible inmediatamente tras avance doble del peón rival
   - Detección por último movimiento y posición adyacente

- PREVENCIÓN DE MOVIMIENTOS ILEGALES:
  - No puedes moverte si dejas a tu rey en jaque
  - Validación en tiempo real
  
- CAPTURA DE FICHAS:
  - Cuando capturas una pieza del contrario, automáticamente aparece en tu panel lateral 
    de "Fichas capturadas"
  - Se suma la puntuación de la pieza capturada a tu marcador

-----------------------------------------------
Jugando una partida:
-----------------------------------------------
PASO 1: Seleccionar pieza
   - Haz clic en una pieza de tu color
   - Verás círculos verdes en movimientos válidos
   - Bordes rojos pulsantes indican capturas posibles

PASO 2: Mover pieza (se podrá deshacer posteriormente hasta los 10 últimos movimientos 
        clicando el botón "Deshacer"")
   - Haz clic en una casilla marcada en verde
   - La pieza se moverá automáticamente
   - El turno pasará al otro jugador

DESELECCIONAR:
   - Haz clic en otra pieza tuya
   - O haz clic en una casilla vacía sin marca

CAPTURAS:
   - Haz clic en una casilla con borde rojo
   - La pieza enemiga será capturada
   - Aparecerá en tu panel lateral de capturas

PROMOCIÓN:
   - Si tu peón llega al extremo opuesto
   - Se abre un modal para elegir pieza: Dama, Torre, Alfil o Caballo
   - La partida se pausa mientras tengamos abierto el modal

ENROQUE:
   - Para intentar enroque: 
     1-. Haz clic en el REY (se resaltará en amarillo)
     2-. Haz clic en la casilla donde quieres mover el rey (G1/G8 para enroque corto,
         C1/C8 para enroque largo)
     3-. Haz clic en la TORRE correspondiente (H1/H8 para enroque corto, A1/A8 para 
         enroque largo)
   - Si es válido, aparece un modal de confirmación preguntando si deseas hacer el enroque
   - Puedes CONFIRMAR para ejecutarlo (rey y torre se mueven automáticamente a sus posiciones 
     finales) o CANCELAR para posponer el enroque y hacer otro movimiento

-----------------------------------------------
Historial de movimientos:
-----------------------------------------------
  1-. Bajo el tablero, haz clic en el desplegable “Historial de movimientos”
  2-. Se desplegará un panel con las jugadas en notación algebraica
    - Ejemplo: 1. e4 e5, 2. Cf3 Cc6, 3. Ab5 O-O
  3-. El historial se guarda junto con la partida y se recupera al cargar

-----------------------------------------------
GLOSARIO DE NOTACIÓN
-----------------------------------------------

PIEZAS (letras en español):
- R: Rey, D: Dama, T: Torre, A: Alfil, C: Caballo, Peón: sin letra (ej. `e4`).

SÍMBOLOS:
- x: captura (ej. `Txd4`).
- +: jaque (ej. `Dg7+`).
- #: jaque mate (ej. `Dg7#`).
- O-O: enroque corto; O-O-O: enroque largo.
- =pieza: promoción (ej. `e8=D`, `c1=C`).
- e.p.: captura al paso (ej. `exd6 e.p.`).

EJEMPLOS:
- `1. e4 e5 2. Cf3 Cc6 3. Ab5 O-O`.
- `Txd4`, `Dg7+`, `e8=D`, `exd6 e.p.`.


Aún se podría mejorar más:
  -Multilenguaje (prácticamente, sería sencillo ya que son una número limitado de frases y siempre son las mismas 
   e incluso con un patrón Observer podríamos cambiar el idioma incluso en tiempo real sin necesidad de hacerlo en 
   el inicio de la partida ni tener que reiniciarla)
  -Más información al usuario.
  -Devolver tiempo perdido a los usuarios al deshacer movimientos
  -Mejoras de UX:
    -Animaciones (movimientos más fluidos, transiciones suaves)
    -Más información al usuario (como por ejemplo al entrar en ajustes durante la partida, 
     informar de más cosas como el tiempo que le queda a cada jugador, fichas capturadas y 
     puntuación de cada jugador, más opciones en ese modal que sólo están en la pantalla de 
     partida, etc)
    -Sonidos (al mover las fichas, acabar el juego, aviso acústico de alguna información, 
     terminación de partida, jaque mate, etc) 
    -Temas (Oscuro/Light o personalización más personalizada y completa)
    -Videos explicativos (de ejemplos de uso)
    -Pequeño tour para que sepas para qué sirve cada elemento del juego
    -Resaltado del cursor 
    -Notificaciones visuales más destacadas para eventos importantes
  -Validación de tablas (mejorar la detección de tablas por repetición o 50 movimientos)
  -Modo multijugador online con WebSockets
  -Guardar puntuaciones con nombres al terminar
  -Que se pudiera jugar contra la computadora, pero eso ya es una funcionalidad muy avanzada
  -Posibilidad de ver un replay o análisis de la partida después de terminar
