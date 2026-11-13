# Dorear · Kit de demostración para redes

Versión revisada: rama `main`, commit `81b36d8964df92a936bebc833483513e9de988b5`, publicado el 1 de noviembre de 2026. Descargado y verificado el 2 de noviembre de 2026.

Repositorio: https://github.com/Nicoguid/Dorear-Menu-Web

## Qué publicar

| Archivo | Duración | Uso |
| --- | --- | --- |
| Dorear_Reel_45s.mp4 | 0:45 | Pieza principal para presentar la carta a clientes. |
| Dorear_Tutorial_Clientes.mp4 | 2:08 | Recorrido guiado para clientes; útil para una publicación explicativa. |
| Dorear_Guia_Equipo.mp4 | 1:42 | Material interno para barra y administración. |
| Dorear_Portada.png | — | Portada vertical de la promoción. |

Los videos son mockups animados con capturas de la interfaz real, títulos e instrucciones en español y una base instrumental original, sin locución. Exportación: MP4, H.264, 1080 × 1920, vertical 9:16, 30 fps y audio AAC. Los textos principales están integrados al video para que se entienda sin sonido. Las transiciones y movimientos suaves se agregaron en la edición; no son una grabación continua del navegador.

Los archivos SRT contienen los mismos textos, por si se quiere adaptar la edición. No hace falta agregarlos a los videos terminados: los títulos ya son visibles.

## Texto sugerido para el reel

Tu ratito en Dorear empieza con un toque. ☕✨

Escaneá el QR del local y explorá nuestra carta desde tu celular: café de especialidad, pastelería de autor, menú ejecutivo y mucho más.

Elegí tu idioma, descubrí las opciones de cada producto y coordiná pedidos para llevar o encuentros con tu grupo por WhatsApp.

📍 Rosario Vera Peñaloza 460, Puerto Madero.

Que espere todo, este ratito es tuyo. 🤎

@dorearcafe.ar

#Dorear #PuertoMadero #CafeDeEspecialidad #PasteleriaDeAutor #CartaDigital

## Texto sugerido para el tutorial

¿Primera vez con nuestra carta digital? Guardá este recorrido. 📱

Te mostramos cómo elegir el idioma, recorrer las categorías, usar los filtros, ver adicionales, consultar el menú semanal y coordinar pedidos y reservas por WhatsApp.

Para alergias o intolerancias, consultá siempre con nuestro equipo antes de ordenar.

Nos encontrás en Rosario Vera Peñaloza 460, Puerto Madero. @dorearcafe.ar

## Funciones cubiertas

| Área | Función | Dónde se muestra |
| --- | --- | --- |
| Acceso | Carta web desde el celular, sin instalar una app | Reel y tutorial |
| Idiomas | Español, inglés y portugués | Reel y tutorial |
| Navegación | Barra de nueve categorías desplazable | Reel y tutorial |
| Productos | Nombre, descripción, foto, precio y estado agotado | Tutorial; estado en guía de equipo |
| Filtros | Todos, Sin TACC, Vegano y Sin Lactosa | Tutorial |
| Adicionales | Hasta una opción; recálculo del precio y advertencias según la elección | Tutorial |
| Menú ejecutivo | Plato destacado por día, cinco días, bebida/café y precios de salón/Take Away | Tutorial |
| Tortas enteras | Consulta por WhatsApp, con anticipación indicada de 48 horas | Tutorial |
| Para llevar | Apertura de WhatsApp con un mensaje preparado | Reel y tutorial |
| Grupos | De 5 a 16 personas; fecha, horario, nombre y teléfono | Tutorial |
| Propuesta grupal | Merienda fija, información de seña, copiar alias/CVU, torta opcional y notas | Tutorial; controles de copia visibles en pantalla |
| Confirmación de reservas | Solicitud por WhatsApp y envío del comprobante al local | Tutorial |
| Conectividad | Datos del Wi-Fi y copia de contraseña | Reel y tutorial |
| Descubrimiento | Reseñas de Google, Maps, dirección, horarios, estado abierto/cerrado e Instagram | Tutorial |
| Sin señal | Indicador al perder la conexión con la carta ya abierta | Tutorial |
| Personal | Acceso por rol y salida al menú de clientes | Guía de equipo |
| Barra | Búsqueda, categorías y disponible/agotado | Guía de equipo |
| Administración | Crear, editar y eliminar productos con confirmación | Guía de equipo |
| Contenido | Textos ES/EN/PT, categoría, foto, precio, etiquetas y frutos secos | Guía de equipo |
| Precios | Edición rápida y guardado | Guía de equipo |
| Semana | Editar platos y precios, calendario automático o selección manual | Guía de equipo |
| Local | WhatsApp, red/clave Wi-Fi y precio de merienda grupal | Guía de equipo |
| Restauración | Recuperación de los valores originales, con confirmación | Guía de equipo |
| Sincronización | Estado “En vivo” y reflejo de la disponibilidad en la carta | Guía de equipo |

La versión fuente contiene 65 productos, 9 categorías y 5 platos ejecutivos. Las traducciones de cada producto se cargan desde administración; los campos vacíos tienen el comportamiento de respaldo que implementa la app.

## Datos de la demo

La grabación se preparó en una copia local. Los códigos de acceso se sustituyeron por accesos de demostración, los datos bancarios se reemplazaron por ejemplos, los datos del formulario son ficticios y las contraseñas están ocultas. No se enviaron mensajes, no se solicitaron reservas reales y no se alteró la aplicación publicada ni el repositorio remoto.

Los precios corresponden al estado inicial del código revisado y a cambios de ejemplo en la guía del equipo. Consultar precios y disponibilidad en la carta vigente. Las imágenes son las fotografías ilustrativas enlazadas por el repositorio. Algunas URLs de fotos del código no responden; las escenas seleccionadas usan las que sí cargan. No se generaron fotos de productos.

Los pedidos y las reservas se coordinan con el equipo por WhatsApp. La confirmación de la mesa y la gestión de la seña ocurren con el local. El indicador sin señal se muestra con la carta ya abierta; el material no promete una primera carga sin conexión.

## Archivos de apoyo

- `Dorear_Repo_81b36d8.zip`: copia intacta del código fuente del commit revisado, sin dependencias ni datos de sesión.
- `Dorear_Proyecto_Editable.zip`: capturas, fuentes gráficas, guion de escenas, subtítulos y script de montaje en Python. Permite cambiar títulos, tiempos o música y volver a exportar.
- `Dorear_Guion_Escenas.json`: orden de escenas, tiempos y textos.

El proyecto editable usa Python 3, Pillow, NumPy y FFmpeg. Desde su carpeta principal, ejecutar `python3 promo-work/make_videos.py`. La renderización puede reutilizar clips ya generados: si se cambia una escena, quitar su clip en `promo-work/clips` antes de volver a exportar. Los videos se generan en `deliverables`.

## Comprobaciones realizadas

La copia original compila con `npm run build` (TypeScript y Vite). Se recorrieron los tres idiomas, categorías, filtros, detalles, adicionales, menú semanal, formulario de grupos, copia de Wi-Fi y paneles internos. Los enlaces de pedidos, tortas y reservas se capturaron de forma local sin enviarlos a WhatsApp. Se probaron cambios de disponibilidad y precio, creación/edición/eliminación de un producto de ejemplo y restauración. La última referencia de `main` se volvió a consultar y coincidía con el commit indicado.
