🌐 Stream Rank

Top10 de peliculas y series actualizado semanalamente utilizando WebScraping.

👥 Integrantes


Paula Yurany Romero Rojas - 1202544
Laura Segura Castañeda - 1202752
Nicole Camila Enciso Velandia - 1202795


🎯 1. Objetivo General

El objetivo del proyecto es diseñar y desarrollar una aplicación web llamada StreamRank, capaz de recolectar automáticamente información pública de rankings de películas y series en portales especializados como IMDb y Rotten Tomatoes, procesarla y presentarla en listados dinámicos y personalizados. Con este sistema se busca solucionar el problema de la sobreoferta de contenido audiovisual distribuido en múltiples plataformas, que dificulta a los usuarios encontrar rápidamente opciones relevantes según sus intereses. La aplicación permitirá no solo explorar tendencias actuales mediante filtros por género, duración, popularidad o plataforma, sino también organizar el consumo personal de contenido a través de herramientas como listas de “Ver después”, registro de películas vistas, calificaciones personales y creación de rankings propios. De esta manera, el sistema combina descubrimiento de tendencias con gestión personalizada, ofreciendo una solución integral para navegar de forma clara y estructurada en el creciente universo audiovisual.


🌍 2. Contexto de Uso

El sistema está orientado a usuarios que consumen regularmente películas y series y que desean descubrir tendencias actuales sin perder tiempo en búsquedas dispersas entre distintas plataformas. Se utilizará principalmente como una aplicación web accesible desde cualquier navegador en computadores, tablets y dispositivos móviles, con una interfaz moderna, intuitiva y adaptable (responsive design). Los usuarios podrán consultar rankings dinámicos, aplicar filtros avanzados, explorar categorías específicas como estudios, franquicias o plataformas, visualizar trailers y organizar su propio contenido mediante watchlists, calificaciones y rankings personalizados. El sistema será útil tanto para quienes buscan recomendaciones rápidas y confiables como para aquellos que desean llevar un registro detallado de su consumo audiovisual, convirtiéndose en una herramienta práctica para explorar, decidir y gestionar películas y series en un solo espacio centralizado.

📋 3. Requerimientos del Sistema
3.1 Requerimientos Funcionales

RF1. Registro de usuario
	 El sistema debe permitir al usuario crear una cuenta para guardar su información y listas personales.

RF2. Inicio de sesión
 	El sistema debe permitir al usuario autenticarse para acceder a sus listas y configuraciones.

RF3. Gestión de perfil
	 El usuario debe poder acceder a su perfil para visualizar sus listas, calificaciones y contenido guardado.

RF4. Visualización de rankings
	 El sistema debe mostrar Top 10 dinámicos de películas y series obtenidos mediante web scraping.

RF5. Filtrar por tipo de contenido
	 El sistema debe permitir filtrar contenido por:
Películas
Series

RF6. Filtrar por género
	 El sistema debe permitir filtrar contenido por género:
Acción
Drama
Comedia
Terror
Otros disponibles

RF7. Filtrar por duración
 	El sistema debe permitir filtrar películas por duración:
Cortas (< 90 min)
Medias (90 – 120 min)
Largas (> 120 min)

RF8. Ordenar rankings
	 El sistema debe permitir ordenar los resultados por:
Rating
Popularidad

RF9. Explorar Top por estudio
	 El sistema debe permitir visualizar rankings por estudios o productoras.
Ejemplo:
Warner
Pixar

RF10. Explorar Top por plataforma
	 El sistema debe permitir visualizar rankings por plataforma de streaming.
Ejemplo:
Netflix
Amazon Prime

RF11. Explorar Top por franquicia o saga
	 El sistema debe permitir visualizar rankings de películas pertenecientes a universos o sagas.
Ejemplo:
Star Wars
Harry Potter

RF12. Visualización de tarjetas de contenido
	 El sistema debe mostrar la información de cada película o serie en tarjetas que incluyan:
Imagen
Título
Rating
Sinopsis corta
Plataforma disponible

RF13. Visualización de trailer
	 El sistema debe permitir reproducir el trailer al hacer clic en la imagen de la película o serie.

RF14. Búsqueda de películas o series
	 El sistema debe permitir al usuario buscar contenido por nombre.

RF15. Visualización de resultados de búsqueda
	 El sistema debe mostrar la información de la película o serie encontrada.

RF16. Crear lista de “Ver después” (Watchlist)
 	El sistema debe permitir guardar películas o series para ver más adelante.

RF17. Marcar contenido como visto
	 El sistema debe permitir marcar películas o series como vistas.

RF18. Calificación personal
	 El usuario debe poder calificar el contenido visto mediante un sistema de estrellas.

RF19. Ordenar contenido por calificación personal
	 El sistema debe permitir ordenar el contenido visto según la calificación del usuario.

RF20. Seguimiento de series
	 El sistema debe permitir al usuario registrar:
temporada actual
episodio actual

RF21. Crear Top 10 personal
	 El sistema debe permitir al usuario crear listas personalizadas de películas o series.

RF22. Agregar contenido a Top personal
	 El usuario debe poder agregar películas o series a sus rankings personales.

RF23. Ordenar manualmente el ranking
	 El usuario debe poder organizar manualmente el orden del Top 10.

RF24. Web scraping automático
	 El sistema debe recolectar información pública de sitios como IMDb y Rotten Tomatoes mediante scraping.

RF25. Extracción de datos
 El sistema debe extraer y almacenar información como:
título
rating
género
duración
imagen
sinopsis
enlace
trailer
plataforma (si aparece)


3.2 Requerimientos No Funcionales

RNF1. Usabilidad
La aplicación deberá contar con una interfaz clara, intuitiva y de fácil navegación, permitiendo al usuario explorar rankings, aplicar filtros y organizar su contenido personal de forma sencilla.

RNF2. Rendimiento
El sistema deberá generar los rankings y resultados de búsqueda en un tiempo de respuesta adecuado (máximo 3 segundos), evitando la ejecución de procesos de scraping en tiempo real durante cada consulta del usuario.

RNF3. Disponibilidad
La aplicación deberá estar disponible como un sistema web accesible desde cualquier navegador con conexión a internet.

RNF4. Escalabilidad
El sistema deberá permitir la incorporación futura de nuevas categorías, plataformas, fuentes de datos o criterios de filtrado sin requerir una reestructuración completa del sistema.

RNF5. Mantenibilidad
La aplicación deberá estar desarrollada bajo una arquitectura modular que facilite el mantenimiento, actualización de funcionalidades y mejora del sistema.

RNF6. Seguridad
El sistema deberá proteger la información de los usuarios registrados, evitando accesos no autorizados a sus listas personales, calificaciones y datos almacenados.

RNF7. Compatibilidad
La aplicación deberá funcionar correctamente en los principales navegadores web modernos, como Google Chrome, Mozilla Firefox, Microsoft Edge y Safari.

RNF8. Actualización de información
El sistema deberá actualizar periódicamente la información obtenida mediante scraping y permitir visualizar la fecha de la última actualización de los datos.

RNF9. Responsive Design
La interfaz de la aplicación deberá adaptarse correctamente a diferentes tamaños de pantalla, incluyendo computadores, tablets y dispositivos móviles.

RNF10. Persistencia de datos
El sistema deberá almacenar de manera segura la información generada por los usuarios, incluyendo:
watchlists
calificaciones
rankings personales
progreso de series.

RNF11. Integridad de datos
El sistema deberá garantizar que la información obtenida mediante scraping sea procesada y almacenada correctamente sin duplicaciones o inconsistencias.

RNF12. Eficiencia del scraping
Los procesos de scraping deberán ejecutarse de forma programada o en segundo plano para evitar sobrecargar el sistema o afectar la experiencia del usuario.

RNF13. Accesibilidad
La aplicación deberá mantener una estructura visual clara y legible que facilite la interacción de los usuarios con el contenido mostrado.


🧠 4. Diagramas UML

Diagrama de Casos de Uso
CU–01 Registro de usuario
El caso de uso de registro de usuario representa el proceso de creación de cuentas dentro del sistema. En este proceso, el usuario ingresa su información personal, la cual es validada por el sistema para garantizar que cumpla con los requisitos establecidos y que no existan duplicados. Posteriormente, los datos son almacenados en la base de datos, permitiendo que el usuario pueda acceder a funcionalidades personalizadas como listas, calificaciones y seguimiento de contenido.
<img width="1064" height="399" alt="caso1" src="https://github.com/user-attachments/assets/c5866633-679b-4b75-92e0-b4a7c22ae646" />

CU–02 Inicio de sesión
El caso de uso de inicio de sesión corresponde al proceso de autenticación del usuario. En este, el sistema recibe las credenciales ingresadas, las valida mediante una consulta a la base de datos y determina si el acceso es permitido o no. Este proceso es fundamental para garantizar la seguridad del sistema y el acceso controlado a la información personal del usuario.
<img width="1012" height="385" alt="caso2" src="https://github.com/user-attachments/assets/848e1711-7337-456f-ab25-10a48a9a4023" />

CU–03 Gestión de perfil
El caso de uso de gestión de perfil representa el proceso de administración de la información del usuario dentro del sistema. A través de este proceso, el usuario puede consultar, modificar y actualizar datos como listas personales, contenido visto, calificaciones y progreso de series. Este proceso se caracteriza por incluir operaciones de tipo CRUD (crear, leer, actualizar y eliminar), asegurando la persistencia y actualización constante de la información.
<img width="780" height="471" alt="caso3" src="https://github.com/user-attachments/assets/7b4a74c8-d14f-463b-ae56-335a07cba198" />

CU–04 Visualización de rankings
El caso de uso de visualización de rankings corresponde al proceso de consulta y presentación de información. En este, el sistema accede a la base de datos, obtiene los datos previamente recolectados, genera dinámicamente un Top 10 según diferentes criterios y los presenta al usuario mediante una interfaz visual estructurada. Este proceso es uno de los principales del sistema, ya que permite la exploración del contenido.
<img width="738" height="741" alt="caso4" src="https://github.com/user-attachments/assets/20f15cea-cdf9-462b-8a7d-b7ce742f89f1" />

CU–05 Búsqueda de contenid
El caso de uso de búsqueda de contenido representa el proceso de recuperación de información. En este proceso, el usuario ingresa un término de búsqueda, el sistema lo procesa y realiza una consulta en la base de datos para encontrar coincidencias. Finalmente, los resultados son devueltos y mostrados al usuario de manera organizada.
<img width="735" height="310" alt="caso5" src="https://github.com/user-attachments/assets/2c7d0394-0ab0-461d-bf8d-1e62e43e45db" />

CU–06 Visualización de contenido
El caso de uso de visualización de contenido corresponde al proceso de presentación detallada de información. En este, el sistema muestra los datos específicos de una película o serie seleccionada, incluyendo elementos como título, imagen, rating, sinopsis y la posibilidad de reproducir el trailer. Este proceso mejora la experiencia del usuario al ofrecer información más completa sobre el contenido.
<img width="744" height="298" alt="caso6" src="https://github.com/user-attachments/assets/9b034376-37f6-43db-ab4c-1533fec06d7f" />

CU–07 Gestión de rankings personales
El caso de uso de gestión de rankings personales representa el proceso de personalización del sistema. A través de este, el usuario puede crear listas propias de contenido, agregar elementos, organizarlos manualmente y almacenarlos en su perfil. Este proceso permite adaptar la experiencia del sistema a las preferencias individuales de cada usuario.
<img width="793" height="315" alt="caso7" src="https://github.com/user-attachments/assets/86d31c81-36d9-4633-b438-fbffc8d75cda" />

CU–08 Web scraping automático
El caso de uso de web scraping automático corresponde al proceso de adquisición y actualización de datos del sistema. En este proceso, el sistema accede a fuentes externas, extrae información relevante como título, rating, género y otros atributos, la procesa y la almacena en la base de datos. Este proceso es fundamental para mantener la información actualizada y garantizar la generación de rankings dinámicos sin depender de consultas en tiempo real.
<img width="904" height="408" alt="caso8" src="https://github.com/user-attachments/assets/fb93018e-c152-4d4e-bdfb-10faba1e8192" />



Diagrama de Secuencia

Diagrama de Secuencia – Registro de Usuario

El diagrama de secuencia correspondiente al proceso de registro de usuario representa la interacción entre el usuario, la interfaz del sistema, el controlador y la base de datos. Inicialmente, el usuario ingresa sus datos a través de la interfaz, los cuales son enviados al controlador para su validación. Posteriormente, el sistema verifica en la base de datos si el usuario ya existe; en caso contrario, procede a almacenar la nueva información y confirmar el registro. Este flujo garantiza la correcta creación de cuentas y la integridad de los datos almacenados.
<img width="723" height="578" alt="secuencia1" src="https://github.com/user-attachments/assets/3f1d144b-a4d9-4272-93c2-8ef1b0907cf4" />

 Diagrama de Secuencia – Inicio de Sesión

El diagrama de secuencia del inicio de sesión describe el proceso de autenticación del usuario dentro del sistema. El usuario introduce sus credenciales en la interfaz, las cuales son enviadas al controlador de autenticación. Este realiza una consulta a la base de datos para validar la información. Dependiendo del resultado, el sistema permite el acceso al usuario o muestra un mensaje de error. Este proceso asegura el control de acceso y la protección de la información personal.
<img width="676" height="461" alt="secuencia2" src="https://github.com/user-attachments/assets/bbc5c319-9fa6-4ba7-9aa3-3b13ccc2b5c8" />

Diagrama de Secuencia – Visualización de Rankings

El diagrama de secuencia de visualización de rankings muestra cómo el usuario interactúa con el sistema para consultar el Top 10 de contenido. El usuario realiza la solicitud desde la interfaz, la cual es enviada al controlador de rankings. Este consulta la base de datos para obtener la información previamente almacenada, procesa los datos y retorna los resultados a la interfaz, donde son presentados en forma de tarjetas. Este flujo permite una visualización rápida y eficiente de la información.
<img width="600" height="422" alt="secuencia3" src="https://github.com/user-attachments/assets/a290a6f9-5416-482e-8274-2cf59bb41124" />

Diagrama de Secuencia – Filtrar y Ordenar Rankings

El diagrama de secuencia de filtrado y ordenamiento de rankings representa la interacción necesaria para personalizar la visualización del contenido. El usuario selecciona diferentes criterios como género, tipo o duración, los cuales son enviados al controlador. Este realiza una consulta a la base de datos aplicando los filtros y criterios de ordenamiento seleccionados. Finalmente, los resultados son devueltos a la interfaz y mostrados al usuario. Este proceso permite una exploración más específica del contenido.
<img width="650" height="372" alt="secuencia4" src="https://github.com/user-attachments/assets/21588d34-29dd-44f8-8be0-30976691387e" />

 Diagrama de Secuencia – Búsqueda de Contenido

El diagrama de secuencia de búsqueda de contenido describe el proceso mediante el cual el usuario encuentra películas o series específicas. El usuario introduce un término de búsqueda en la interfaz, que es enviado al controlador. Este realiza una consulta en la base de datos para encontrar coincidencias y retorna los resultados al sistema, donde son presentados al usuario. Este flujo permite una recuperación rápida y eficiente de información.
<img width="605" height="357" alt="secuencia5" src="https://github.com/user-attachments/assets/634174b7-35f7-412f-a8e7-6df6cfd14b65" />

 Diagrama de Secuencia – Gestión de Watchlist y Contenido Personal

El diagrama de secuencia de gestión de contenido personal representa la interacción entre el usuario y el sistema para administrar listas como la watchlist, contenido visto o calificaciones. El usuario realiza una acción desde la interfaz, como agregar contenido o marcarlo como visto, la cual es enviada al controlador. Este procesa la solicitud y actualiza la base de datos, confirmando posteriormente la operación al usuario. Este proceso permite mantener actualizada la información personal del usuario.
<img width="740" height="357" alt="secuencia6" src="https://github.com/user-attachments/assets/d51d6d45-a304-43dd-8ec8-4efe7cc33b22" />

Diagrama de Secuencia – Web Scraping Automático

El diagrama de secuencia del web scraping automático representa el proceso interno del sistema para la obtención de información externa. Un proceso programado inicia la ejecución del scraping, el cual accede a diferentes sitios web para extraer datos relevantes. Estos datos son enviados a un módulo de procesamiento que los organiza y valida antes de almacenarlos en la base de datos. Este flujo garantiza la actualización constante de la información sin intervención directa del usuario.
<img width="800" height="443" alt="secuencia7" src="https://github.com/user-attachments/assets/284153bd-10a5-4f1e-977f-f86964f9e79b" />


🎨 5. URL del Prototipo

Colocar aquí el enlace público de Figma:

https://www.figma.com/design/d9VySyDjuK3QvUUTd6jkqJ/app_tecnologias?node-id=59-4854&t=iA15ycT9AUkncqoE-1


🗄️ 6. Diseño de Base de Datos

Agregar imagen del modelo.
Tablas principales

🧩 7. Documentación del Sistema
Estructura de Carpetas
/css
/js
/assets

Explicar brevemente qué contiene cada carpeta.

🚀 8. Instalación y Ejecución

Explicar cómo correr el proyecto.
