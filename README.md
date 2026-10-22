# Mr. Sushi | Gasto publicitario 2026

Dashboard de Agencia Lima Retail para controlar la inversion publicitaria de Mr. Sushi en Meta Ads. La cuenta
publicitaria factura en dolares: todos los montos del tablero van en US$ (`CURRENCY` en `js/data-source.js`). El foco de
la cuenta son los mensajes: las conversaciones iniciadas se miden en toda la cuenta, aparte de los resultados de
cada objetivo.

Version actual: `v1.5.0`.

## Versionado

El proyecto usa la nomenclatura `vMAJOR.MINOR.PATCH`:

- `MAJOR`: cambios incompatibles o una nueva etapa del tablero.
- `MINOR`: nuevos modulos, indicadores o funciones compatibles.
- `PATCH`: correcciones visuales, de datos o funcionamiento.

La version vive en tres lugares: `package.json`, la etiqueta del panel lateral (`index.html`) y este README.

## Modulos activos

- Gasto publicitario: indicadores del reporte de Ads por mes, calculados con la descarga de Meta.
  - Pestanas de Enero a Diciembre y una pestana Anual con todos los meses con descarga.
  - Resumen del periodo: inversion, conversaciones, costo por conversacion, impresiones, alcance y CPM, con la
    variacion contra el mismo tramo del mes anterior (un mes cerrado se compara completo). En la vista Anual,
    promedio mensual de los meses cerrados.
  - Distribucion de la inversion por campana y un cuadro por objetivo (Mensajes, Reconocimiento, Trafico al
    perfil) con sus KPIs, su grafico, sus conjuntos de anuncios y sus anuncios.
  - Grafico de cada cuadro: `Por dia` o `Por mes` (sin acumulado del mes: siempre sube y exagera el crecimiento)
    e indicadores resultado, inversion, impresiones, alcance y costo por resultado (inversion / resultados de cada
    dia o mes; un dia sin resultados queda como hueco). Cada punto lleva su valor (si dos etiquetas chocan, una baja
    bajo el punto o queda solo en el tooltip). Varios indicadores van en paneles apilados, cada uno con su escala, o
    con el boton `Un solo cuadro` todos juntos, un color por indicador y cada uno con su escala (sin eje: el valor
    va en el punto); uno solo va contra el mes anterior en el mismo dia. Indicadores, vista y un solo cuadro se
    recuerdan por objetivo.
- Anuncios: Top 3 de anuncios por conversaciones iniciadas (a igual cantidad, menor costo por conversacion) y la
  tabla de todos los anuncios del periodo con filtro por objetivo, densidad compacta y pantalla completa.
- Proyecciones: cierre de mes estimado por objetivo (resultados y gasto).
- Calculadora de Inversion: facturacion objetivo, ventas necesarias e inversion en mensajes por CPL.
- Historico de Campanas: todas las campanas de las descargas de Meta, activas y finalizadas, con su gasto mes a mes.
- Archivo de Reportes: catalogo de la carpeta de reportes en Google Drive y validacion contra Gasto publicitario.
  - Pestana Generacion de Reporte, dentro de Archivo de Reportes: el reporte semanal de lunes a domingo, con el orden del ultimo reporte de la carpeta de Drive y descarga en PDF (ver "Generacion de Reporte").
- Bitacora: checklist mensual de cambios, comentarios y decisiones de la cuenta.

El pie del panel lateral lleva el nombre de la cuenta, el WhatsApp de Agencia Lima Retail
(+51 937 409 733) y www.limaretail.com. El modulo "Usuarios y Claves" salio del tablero; el
directorio guardado sigue en el repositorio por si hace falta recuperarlo.

## Datos

La fuente son las descargas de Meta Ads ("Raw Data Report": una fila por dia x edad x sexo x anuncio), que una
automatizacion de la agencia deja a diario como un Google Sheet por mes en la carpeta de Drive "Meta files -
Mr. Sushi".

- Nombre de cada archivo: `Mr. Sushi - <Mes> <Ano>` (por ejemplo `Mr. Sushi - Octubre 2026`). Tiene que ser
  un Google Sheet (no `.xlsx`) y debe haber uno solo por mes; si hay dos, se usa el editado mas recientemente y
  la validacion lo avisa.
- Columnas que usa el barrido (en espanol): Dia, Nombre de la campana, Nombre del conjunto de anuncios, Nombre del
  anuncio, Monto gastado (USD), Impresiones, Alcance, Clics en el enlace, Tipo de resultado, Resultados,
  Conversaciones con mensajes iniciadas y Enlace de vista previa.
- El Web App de `scripts/google-sheets-sync.gs` lee la carpeta de descargas y la de reportes, suma edad y sexo y
  guarda el barrido en un JSON de Drive. `js/data-source.js` (`window.MrSushiData`) lo pide al abrir el tablero,
  cada hora y al volver a la pestana, y lo reparte a todos los modulos con el evento `mrsushi:data-updated`.
- Barrido automatico: todos los dias entre 10:00 y 11:00 (hora de Lima), aunque nadie abra el tablero. El boton
  **Actualizar** hace un barrido en el momento.
- Barra superior (como Royal Baby): queda fija al hacer scroll y su bajada repite la descripcion del modulo en el
  panel lateral. A la derecha, la pildora de sincronizacion dice "Sincronizado · hace 2 h" en verde; en ambar dice
  "Copia guardada · hace N h", "Aun no sincronizado" o lleva mas de un dia y medio sin barrido;
  en rojo, "Sin conexion con Google"; y en ambar con el punto latiendo, "Recargando…" mientras corre Actualizar. Su
  title trae la linea completa (datos al dia N, origen y hora del barrido) y al pulsarla abre el detalle (datos
  cargados, ultimo barrido, proximo automatico, archivo del mes y fuente). Al lado esta el boton fantasma
  **Actualizar**, con icono de recarga que gira mientras dura el barrido.
- El repo es publico, asi que ni la URL del Web App, ni los IDs de las carpetas, ni los datos del cliente se
  guardan en el: `npm run build` toma la URL del secret `DATA_ENDPOINT`, baja el ultimo barrido y lo incrusta en
  `dist/index.html` (que solo se sirve cifrado). La copia queda tambien en `data/mrsushi-meta.json`, que esta en
  `.gitignore`.
- Solo se muestra lo que tuvo gasto o impresiones en el periodo elegido (`hasActivity` en `js/data-source.js`).
- Objetivos: se deducen del nombre de la campana (`OBJECTIVES` en `js/data-source.js`): "mensajes" -> Mensajes,
  "reconocimiento" -> Reconocimiento, "trafico al perfil" -> Trafico al perfil (IG). Una campana que no encaje toma el texto antes del primer `|` como objetivo.
- Conversaciones: se suman en todas las campanas (una de trafico o reconocimiento tambien puede iniciarlas). El costo por
  conversacion usa solo las campanas cuyo resultado son conversaciones (las de mensajes): su gasto entre sus
  conversaciones. Sin campana de mensajes en el periodo queda en "-".
- El alcance es la suma de las filas de la descarga, igual que en los reportes de la agencia (no el alcance sin
  duplicar de Meta).

## Generacion de Reporte

Pestana que arma el reporte de la semana que acaba de pasar, de lunes a domingo, con el mismo orden del
ultimo reporte publicado en la carpeta Reportes de Drive: resumen del periodo, conversaciones por dia,
mejores anuncios, conjuntos y campanas, y conclusiones.

- **De donde salen los numeros:** de las mismas filas del barrido de Meta que usa Gasto publicitario (una
  fila por dia, campana, conjunto y anuncio). No hay una fuente nueva ni una lectura extra.
- **Que semana muestra:** la ultima de lunes a domingo ya cerrada (en hora de Lima). El selector deja ver
  las 12 anteriores. La semana en curso no se lista: el reporte es de semana completa.
- **Cada lunes se puebla solo:** el tablero relee el barrido al abrirse y con Actualizar, y el workflow de Pages vuelve a publicar todos los dias despues del barrido.
- **Si la descarga del mes no llega al domingo**, el reporte lo avisa arriba y nombra los dias que faltan:
  los totales pueden subir cuando se suba la descarga nueva.
- **Resultados:** cada objetivo mide el suyo (ThruPlay, interacciones, contactos...), asi que no se suman
  entre si. Con columna de conversaciones, ese es el numero que encabeza; si no, encabeza el tipo con mas inversion y los demas van en el desglose.
- **Conclusiones:** las dos primeras vienen propuestas con lo que dice la semana y se editan en la pestana;
  quedan guardadas por semana en el navegador (`mrsushi-week-notes-v1`), no se publican con el tablero.
- **Descargar PDF** abre el dialogo de impresion con el reporte solo (sin panel lateral ni barra superior)
  y el nombre del archivo ya armado.

El modulo es `js/report-week.js` y es el mismo archivo en todos los tableros de marca: lo unico que cambia
es el bloque `CONFIG` de arriba. Sus estilos y los de impresion estan al final de `css/dashboard.css`.

## Calculadora de Inversion

- Ventas necesarias = (facturacion objetivo - facturacion ya realizada) / ticket promedio.
- Inversion = mensajes objetivo x costo por lead de cada conjunto de anuncios.
- "Usar CPL real" toma el costo por conversacion de las campanas de Mensajes en el ultimo mes con datos; se oculta
  si ese mes no tuvo campana de Mensajes.
- Los valores se guardan en `localStorage` (`mrsushi_messages_calculator_v1`) de ese navegador.


## Configuracion del Web App (Google Apps Script)

La cuenta duena del proyecto de Apps Script es la de Lima Retail que tiene acceso a las dos carpetas de Drive (la
de descargas es compartida). Si esa cuenta pierde el acceso, el barrido se detiene.

1. En [script.google.com](https://script.google.com) crear un proyecto independiente, pegar
   `scripts/google-sheets-sync.gs` y poner la zona horaria del proyecto en America/Lima.
2. Configuracion del proyecto > Propiedades del script: `DATA_FOLDER_ID` (carpeta de descargas de Meta) y
   `REPORTS_FOLDER_ID` (carpeta de reportes). Los IDs nunca van en el repo.
3. Ejecutar una vez `installSweepTriggers()`: programa el barrido diario de las 10:00 y hace el primero.
   `probarBarrido()` muestra en el registro las filas, el gasto y el rango de fechas de cada mes.
4. Implementar > Nueva implementacion > Aplicacion web, ejecutar como "Yo" y acceso "Cualquier persona". Quien
   tenga la URL puede leer los numeros: la URL solo se guarda como secret.
5. Guardar la URL `https://script.google.com/macros/s/.../exec` en GitHub > Settings > Secrets and variables >
   Actions como `DATA_ENDPOINT`. Al cambiar el codigo del script: Implementar > Administrar implementaciones >
   editar > Nueva version (la URL no cambia).

| Que | Donde |
| --- | --- |
| Carpetas de descargas de Meta y de reportes | Propiedades del script `DATA_FOLDER_ID` y `REPORTS_FOLDER_ID` |
| URL del Web App | secret de GitHub `DATA_ENDPOINT` |
| Clave de acceso al tablero | secret de GitHub `DASHBOARD_PASSWORD` |
| Logo y favicon | `assets/logo-mrsushi.png`, `assets/favicon.png` |
| Color de marca | `--brand*` en `css/dashboard.css` |

## Desarrollo

```
npm install
npm run dev      # live-server en el puerto 3000 (usa la copia data/mrsushi-meta.json, sin lectura en vivo)
npm run build    # genera dist/ con todo incrustado (con DATA_ENDPOINT baja los datos y activa la lectura en vivo)
```

`dist/` lleva `index.html` (CSS, JS y datos incrustados), `assets/`, `CNAME` y `robots.txt`. Nada mas: `scripts/`,
`data/` y el resto del repo nunca se publican. Con `DASHBOARD_PASSWORD=<clave> npm run build` el `index.html` sale
cifrado, como en GitHub Pages. Detener live-server antes de compilar si esta sirviendo `dist/`.

## Publicacion en mrsushi.limaretail.com (GitHub Pages)

URL publica: **https://mrsushi.limaretail.com**. Cada push a `main` la actualiza y ademas se vuelve a publicar
todos los dias a las 11:30 de Lima con el barrido del dia (`.github/workflows/deploy-pages.yml`).

- Settings > Pages > Source: GitHub Actions. El dominio propio se guarda en **Settings > Pages > Custom domain**
  (con Actions el archivo `CNAME` no basta) y luego **Enforce HTTPS**.
- DNS en Banahosting (cPanel > Zone Editor > `limaretail.com`): registro **CNAME** `mrsushi` ->
  `jorgeluis666.github.io`.
- **Clave:** `scripts/build.js` cifra el tablero completo (datos, JS y URL del Web App) con AES-256-GCM y una llave
  PBKDF2-SHA256 (600 000 iteraciones) derivada del secret **`DASHBOARD_PASSWORD`** (minimo 8 caracteres, sin
  saltos de linea; se ignoran los espacios de los extremos). `deploy/pages-gate.html` pide la clave y lo descifra
  en el navegador. Si falta un secret, el workflow falla en vez de publicar. Despues del build el workflow
  comprueba que no quede nada en claro.
- Para cambiar la clave: editar el secret `DASHBOARD_PASSWORD` y volver a ejecutar el workflow (Actions >
  Publicar en GitHub Pages > Run workflow).
- Tras entrar, la llave (no la clave) queda en `sessionStorage` de esa pestana y se pierde al cerrarla.
