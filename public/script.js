// ========================================
// CONFIGURACIÓN DEL MODAL DE AJUSTES
// ========================================
// Obtenemos los elementos principales del modal de configuración
const modal = document.getElementById("modalConfiguracion");
const btnConfiguracion = document.getElementById("btnConfiguracion");
const closeModal = document.querySelector(".close-modal");
const btnCancelar = document.querySelector(".btn-cancelar-config");

// Si todos los elementos existen, configuramos el comportamiento del modal
if (modal && btnConfiguracion && closeModal && btnCancelar) {
  // Función para reanudar la partida después de cerrar los ajustes
  function reanudarDesdeModal() {
    // Enviamos una solicitud al servidor para reanudar la partida
    fetch("index.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ reanudar_desde_configuracion: "1" }),
    })
      .then(() => {
        // Marcamos localmente que no estamos en pausa
        pausaLocal = false;
        // Reseteamos el contador de sincronización
        contadorSincronizacion = 0;
        // Sincronizamos inmediatamente con el servidor para obtener los tiempos correctos
        return fetch("index.php?ajax=actualizar_relojes");
      })
      .then((r) => r.json())
      .then((data) => {
        // Si hay partida activa y no está terminada, actualizamos los tiempos locales
        if (!data.sin_partida && !data.partida_terminada) {
          tiempoLocalBlancas = data.tiempo_blancas;
          tiempoLocalNegras = data.tiempo_negras;
          relojActivoLocal = data.reloj_activo;
        }
        // Actualizamos los relojes en la pantalla
        actualizarDisplayRelojes();
        // Quitamos el mensaje de pausa del DOM
        const msgDiv = document.querySelector(".mensaje");
        if (msgDiv) {
          msgDiv.classList.remove("pausa");
          msgDiv.classList.remove("terminada");
          msgDiv.textContent = "";
        }
      })
      .catch((e) => console.error("No se pudo reanudar desde ajustes:", e));
  }

  // Cuando se abre el modal de configuración
  btnConfiguracion.onclick = () => {
    // Mostramos el modal
    modal.style.display = "block";
    // Marcamos localmente que estamos en pausa
    pausaLocal = true;

    // Pausamos la partida en el servidor para que no corra el reloj
    fetch("index.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ pausar_desde_configuracion: "1" }),
    })
      .then(() => {
        // Confirmamos la pausa local
        pausaLocal = true;
        // Actualizamos el display de relojes
        actualizarDisplayRelojes();
        // Mostramos el mensaje de pausa en naranja
        const msgDiv = document.querySelector(".mensaje");
        if (msgDiv) {
          msgDiv.textContent = "\u23F8\uFE0F PARTIDA EN PAUSA";
          msgDiv.classList.remove("terminada");
          msgDiv.classList.add("pausa");
        }
      })
      .catch((e) => console.error("No se pudo pausar al abrir ajustes:", e));
  };

  // Cuando se hace clic en la X del modal
  closeModal.onclick = () => {
    modal.style.display = "none";
    // Reanudamos la partida
    reanudarDesdeModal();
  };

  // Cuando se hace clic en el botón Cancelar
  btnCancelar.onclick = () => {
    modal.style.display = "none";
    // Reanudamos la partida
    reanudarDesdeModal();
  };

  // Cuando se hace clic fuera del modal (en el overlay)
  window.onclick = (e) => {
    if (e.target == modal) {
      modal.style.display = "none";
      // Reanudamos la partida
      reanudarDesdeModal();
    }
  };
}

// ========================================
// CONTROL DEL BOTÓN GUARDAR CONFIGURACIÓN
// ========================================
// Obtenemos los elementos del formulario de configuración
const formConfig = modal ? modal.querySelector("form") : null;
const btnGuardarConfig = modal
  ? modal.querySelector(".btn-guardar-config")
  : null;
const chkCoords = modal
  ? modal.querySelector('input[name="mostrar_coordenadas"]')
  : null;
const chkCapturas = modal
  ? modal.querySelector('input[name="mostrar_capturas"]')
  : null;

// Si el formulario existe, controlamos que el botón guardar solo se active si hay cambios
if (formConfig && btnGuardarConfig && chkCoords && chkCapturas) {
  // Guardamos el estado inicial de los checkboxes
  const estadoInicial = {
    coords: chkCoords.checked,
    capturas: chkCapturas.checked,
  };

  // Función para actualizar el estado del botón guardar
  const actualizarEstadoGuardar = () => {
    // Verificamos si algo cambió comparando con el estado inicial
    const cambiado =
      chkCoords.checked !== estadoInicial.coords ||
      chkCapturas.checked !== estadoInicial.capturas;
    // Si nada cambió, deshabilitamos el botón
    btnGuardarConfig.disabled = !cambiado;
    btnGuardarConfig.classList.toggle("btn-disabled", !cambiado);
  };

  // Cuando se hace clic en guardar cambios
  btnGuardarConfig.addEventListener("click", (e) => {
    // Solo permitir si el botón está habilitado
    if (
      !btnGuardarConfig.disabled &&
      !btnGuardarConfig.classList.contains("btn-disabled")
    ) {
      e.preventDefault();

      // Creamos un campo oculto para reanudar desde config
      let inputReanudar = formConfig.querySelector(
        'input[name="reanudar_desde_configuracion"]',
      );
      if (!inputReanudar) {
        inputReanudar = document.createElement("input");
        inputReanudar.type = "hidden";
        inputReanudar.name = "reanudar_desde_configuracion";
        inputReanudar.value = "1";
        formConfig.appendChild(inputReanudar);
      }

      // Enviamos el formulario con los cambios
      formConfig.submit();
    }
  });

  // Cuando cambian los checkboxes, actualizamos el estado del botón
  chkCoords.addEventListener("change", actualizarEstadoGuardar);
  chkCapturas.addEventListener("change", actualizarEstadoGuardar);
  // Actualizamos el estado inicial
  actualizarEstadoGuardar();
}

// ========================================
// SISTEMA DE ACTUALIZACIÓN DE RELOJES
// ========================================
// Variables locales para controlar los relojes sin depender de AJAX cada 100ms
let intervaloRelojes = null; // Intervalo para actualizar relojes cada segundo
let tiempoLocalBlancas = 0; // Segundos restantes para blancas
let tiempoLocalNegras = 0; // Segundos restantes para negras
let relojActivoLocal = "blancas"; // Quién está jugando ahora
let pausaLocal = false; // Si la partida está en pausa
let contadorSincronizacion = 0; // Contador para sincronizar cada 5 segundos
let recargandoPagina = false; // Flag para evitar múltiples recargas cuando se agota el tiempo
let sinTiempoLocal = false; // Flag para indicar si es una partida sin tiempo

// Función para formatear segundos a MM:SS
function formatearTiempo(segundos) {
  return (
    String(Math.floor(segundos / 60)).padStart(2, "0") +
    ":" +
    String(segundos % 60).padStart(2, "0")
  );
}

// Actualizar lo que se ve en el HTML de los relojes
function actualizarDisplayRelojes() {
  // Obtenemos los elementos donde se muestran los tiempos
  const tb = document.getElementById("tiempo-blancas");
  const tn = document.getElementById("tiempo-negras");

  // Si los elementos no existen, salimos
  if (!tb || !tn) return;

  // Mostramos los tiempos formateados o el símbolo de infinito si es sin tiempo
  if (sinTiempoLocal) {
    tb.textContent = "♾️";
    tn.textContent = "♾️";
  } else {
    tb.textContent = formatearTiempo(tiempoLocalBlancas);
    tn.textContent = formatearTiempo(tiempoLocalNegras);
  }

  // Resaltamos en rojo SOLO el reloj del jugador que está jugando si le quedan menos de 60 segundos
  // (pero solo si no es sin tiempo)
  if (!sinTiempoLocal) {
    if (relojActivoLocal === "blancas") {
      tiempoLocalBlancas < 60
        ? tb.classList.add("tiempo-critico")
        : tb.classList.remove("tiempo-critico");
      tn.classList.remove("tiempo-critico");
    } else {
      tiempoLocalNegras < 60
        ? tn.classList.add("tiempo-critico")
        : tn.classList.remove("tiempo-critico");
      tb.classList.remove("tiempo-critico");
    }
  }

  // Actualizamos los estilos de reloj activo/inactivo en todos los relojes
  document.querySelectorAll(".reloj").forEach((r) => {
    if (r.classList.contains("reloj-blancas")) {
      // Si es el reloj de blancas y blancas está jugando
      relojActivoLocal === "blancas"
        ? (r.classList.add("reloj-activo"),
          r.classList.remove("reloj-inactivo"))
        : (r.classList.remove("reloj-activo"),
          r.classList.add("reloj-inactivo"));
    } else if (r.classList.contains("reloj-negras")) {
      // Si es el reloj de negras y negras está jugando
      relojActivoLocal === "negras"
        ? (r.classList.add("reloj-activo"),
          r.classList.remove("reloj-inactivo"))
        : (r.classList.remove("reloj-activo"),
          r.classList.add("reloj-inactivo"));
    }
  });
}

// Función que se ejecuta cada segundo para decrementar el reloj
function actualizarTiempoLocal() {
  // Si ya estamos recargando la página, no hacer nada
  if (recargandoPagina) return;

  // Verificamos que existen los elementos del reloj
  if (
    !document.getElementById("tiempo-blancas") ||
    !document.getElementById("tiempo-negras")
  ) {
    return;
  }

  // Si no está en pausa, decrementamos el reloj del jugador actual
  if (!pausaLocal && !sinTiempoLocal) {
    if (relojActivoLocal === "blancas" && tiempoLocalBlancas > 0) {
      tiempoLocalBlancas--;
    } else if (relojActivoLocal === "negras" && tiempoLocalNegras > 0) {
      tiempoLocalNegras--;
    }

    // Si se agotó el tiempo, recargamos la página SOLO UNA VEZ (pero solo si no es sin tiempo)
    if (
      (tiempoLocalBlancas <= 0 || tiempoLocalNegras <= 0) &&
      !recargandoPagina
    ) {
      recargandoPagina = true;
      // Detenemos el intervalo de actualización
      clearInterval(intervaloRelojes);
      intervaloRelojes = null;
      // Recargamos la página para mostrar el resultado
      location.reload();
      return;
    }
  }

  // Actualizamos lo que se ve en pantalla
  actualizarDisplayRelojes();

  // Cada 5 segundos sincronizamos con el servidor para verificar que los tiempos sean correctos
  contadorSincronizacion++;
  if (contadorSincronizacion >= 5) {
    sincronizarConServidor();
    contadorSincronizacion = 0;
  }
}

// Función para sincronizar los tiempos con el servidor
function sincronizarConServidor() {
  // Si ya estamos recargando, no sincronizar
  if (recargandoPagina) return;

  // Solicitamos los tiempos actuales al servidor
  fetch("index.php?ajax=actualizar_relojes")
    .then((r) => {
      if (!r.ok) throw new Error("Error en respuesta HTTP: " + r.status);
      return r.json();
    })
    .then((data) => {
      // Si ya estamos recargando, ignorar los datos
      if (recargandoPagina) return;

      // Si no hay partida, salimos
      if (data.sin_partida) return;

      // Si la partida terminó, detenemos todo sin recargar
      if (data.partida_terminada) {
        if (intervaloRelojes !== null) {
          clearInterval(intervaloRelojes);
          intervaloRelojes = null;
        }
        return;
      }

      // Si el servidor nos envía tiempos válidos
      if (
        data.tiempo_blancas !== undefined &&
        data.tiempo_negras !== undefined
      ) {
        // Actualizamos nuestros tiempos locales con los del servidor
        tiempoLocalBlancas = data.tiempo_blancas;
        tiempoLocalNegras = data.tiempo_negras;
        relojActivoLocal = data.reloj_activo;
        pausaLocal = data.pausa || false;
        sinTiempoLocal = data.sin_tiempo || false;

        // Log para debugging si la partida está en pausa
        if (data.pausa) {
          console.warn(
            "⚠️ LA PARTIDA ESTÁ EN PAUSA - Los movimientos están bloqueados",
          );
        }

        // Actualizamos la pantalla
        actualizarDisplayRelojes();

        // Si el tiempo se agotó desde el servidor, detenemos el intervalo (solo si no es sin tiempo)
        if (
          !sinTiempoLocal &&
          (data.tiempo_blancas <= 0 || data.tiempo_negras <= 0)
        ) {
          if (intervaloRelojes !== null) {
            clearInterval(intervaloRelojes);
            intervaloRelojes = null;
          }
        }
      }
    })
    .catch((e) => {
      console.error("Error al sincronizar relojes:", e);
    });
}

// ========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ========================================
// Manejar avatares personalizados y funciones adicionales
document.addEventListener("DOMContentLoaded", function () {
  // Reseteamos el flag de recarga cuando la página se carga
  recargandoPagina = false;

  // Si no hay un intervalo de relojes activo, lo iniciamos
  if (!intervaloRelojes && document.getElementById("tiempo-blancas")) {
    // Primero sincronizamos con el servidor para verificar el estado de la partida
    fetch("index.php?ajax=actualizar_relojes")
      .then((r) => r.json())
      .then((data) => {
        // Si no hay partida o ya terminó, no iniciamos los relojes
        if (data.sin_partida || data.partida_terminada) {
          return;
        }
        // Si hay partida activa, inicializamos las variables locales
        tiempoLocalBlancas = data.tiempo_blancas;
        tiempoLocalNegras = data.tiempo_negras;
        relojActivoLocal = data.reloj_activo;
        pausaLocal = data.pausa || false;
        sinTiempoLocal = data.sin_tiempo || false;
        // Actualizamos la pantalla
        actualizarDisplayRelojes();
        // Iniciamos el intervalo para actualizar cada segundo
        intervaloRelojes = setInterval(actualizarTiempoLocal, 1000);
      })
      .catch((e) => console.error("Error al inicializar relojes:", e));
  }

  // ========================================
  // GESTIÓN DE AVATARES PERSONALIZADOS
  // ========================================
  // Obtenemos los selectores de avatar (nueva estructura)
  const tipoBlancas = document.querySelector(
    'select[name="tipo_avatar_blancas"]',
  );
  const tipoNegras = document.querySelector(
    'select[name="tipo_avatar_negras"]',
  );
  const fichaBlancas = document.querySelector(
    'select[name="avatar_ficha_blancas"]',
  );
  const fichaNegras = document.querySelector(
    'select[name="avatar_ficha_negras"]',
  );
  const gifBlancas = document.querySelector(
    'select[name="avatar_gif_blancas"]',
  );
  const gifNegras = document.querySelector('select[name="avatar_gif_negras"]');
  const hiddenBlancas = document.getElementById("avatar_blancas_hidden");
  const hiddenNegras = document.getElementById("avatar_negras_hidden");
  const inputBlancas = document.getElementById("avatar_personalizado_blancas");
  const inputNegras = document.getElementById("avatar_personalizado_negras");

  // Función para validar que el archivo sea una imagen válida
  function validarArchivo(file) {
    // Solo permitimos JPEG, PNG y GIF
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 2 * 1024 * 1024; // Máximo 2MB

    // Verificamos el tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      alert("Solo se permiten archivos de imagen (JPEG, PNG, GIF)");
      return false;
    }

    // Verificamos el tamaño
    if (file.size > maxSize) {
      alert("El archivo es demasiado grande. Máximo 2MB.");
      return false;
    }

    return true;
  }

  // Función para mostrar una previsualización de la imagen seleccionada en el avatar display
  function mostrarPrevisualizacionAvatar(input, avatarDisplayId) {
    const file = input.files[0];
    // Si hay archivo y es válido
    if (file && validarArchivo(file)) {
      // Leemos el archivo como URL de datos
      const reader = new FileReader();
      reader.onload = function (e) {
        // Obtenemos el elemento donde mostraremos el avatar
        const avatarDisplay = document.getElementById(avatarDisplayId);
        if (avatarDisplay) {
          // Limpiamos el contenido anterior
          avatarDisplay.innerHTML = "";
          // Creamos la imagen
          const img = document.createElement("img");
          img.src = e.target.result;
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.borderRadius = "50%";
          img.style.objectFit = "cover";
          img.style.border = "3px solid #5568d3";
          img.style.boxShadow = "0 4px 10px rgba(85, 104, 211, 0.3)";
          // La añadimos al avatar display
          avatarDisplay.appendChild(img);
        }
      };
      // Leemos el archivo
      reader.readAsDataURL(file);
    }
  }

  // Función para actualizar el avatar display con una imagen predefinida
  function actualizarAvatarDisplay(rutaImagen, avatarDisplayId) {
    const avatarDisplay = document.getElementById(avatarDisplayId);
    if (avatarDisplay && rutaImagen && rutaImagen !== "predeterminado") {
      // Limpiamos el contenido anterior
      avatarDisplay.innerHTML = "";
      // Creamos la imagen
      const img = document.createElement("img");
      img.src = rutaImagen;
      // Fallback: si la imagen no carga, restaurar símbolo por defecto
      img.onerror = () => {
        avatarDisplay.innerHTML =
          avatarDisplayId === "avatar-display-blancas" ? "♔" : "♚";
      };
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.borderRadius = "50%";
      img.style.objectFit = "cover";
      img.style.border = "3px solid #5568d3";
      img.style.boxShadow = "0 4px 10px rgba(85, 104, 211, 0.3)";
      // La añadimos al avatar display
      avatarDisplay.appendChild(img);
    } else if (
      avatarDisplay &&
      (!rutaImagen || rutaImagen === "predeterminado")
    ) {
      // Si se selecciona "Sin avatar", volvemos al símbolo
      const esBlancas = avatarDisplayId === "avatar-display-blancas";
      avatarDisplay.innerHTML = esBlancas ? "♔" : "♚";
      avatarDisplay.style.display = "";
    }
  }

  // MANEJO DE AVATARES DEL JUGADOR BLANCO (nueva estructura)
  if (tipoBlancas && inputBlancas && hiddenBlancas) {
    const contenedorBlancas = document.getElementById(
      "contenedor-personalizado-blancas",
    );
    const nombreArchivoBlancas = document.getElementById(
      "nombre-archivo-blancas",
    );
    const contFichaBlancas = document.getElementById("opciones-ficha-blancas");
    const contGifBlancas = document.getElementById("opciones-gif-blancas");
    const contCampeonesBlancas = document.getElementById(
      "opciones-campeones-blancas",
    );

    function setAvatarBlancas(valor) {
      hiddenBlancas.value = valor || "predeterminado";
      actualizarAvatarDisplay(valor, "avatar-display-blancas");
    }

    tipoBlancas.addEventListener("change", function () {
      const v = this.value;
      // Reset visibilidad
      if (contFichaBlancas) contFichaBlancas.style.display = "none";
      if (contGifBlancas) contGifBlancas.style.display = "none";
      if (contCampeonesBlancas) contCampeonesBlancas.style.display = "none";
      if (contenedorBlancas) contenedorBlancas.style.display = "none";

      if (v === "predeterminado") {
        setAvatarBlancas("predeterminado");
      } else if (v === "usuario") {
        setAvatarBlancas("public/imagenes/avatares/user_white.png");
      } else if (v === "ficha") {
        if (contFichaBlancas) contFichaBlancas.style.display = "block";
        if (fichaBlancas) {
          setAvatarBlancas(fichaBlancas.value);
        }
      } else if (v === "gif") {
        if (contGifBlancas) contGifBlancas.style.display = "block";
        if (gifBlancas) {
          setAvatarBlancas(gifBlancas.value);
        }
      } else if (v === "campeones") {
        if (contCampeonesBlancas) contCampeonesBlancas.style.display = "block";
        const campeonBlancas = document.querySelector(
          'select[name="avatar_campeon_blancas"]',
        );
        if (campeonBlancas) {
          setAvatarBlancas(campeonBlancas.value);
        }
      } else if (v === "personalizado") {
        // Mostrar input de archivo y marcar como personalizado
        if (contenedorBlancas) contenedorBlancas.style.display = "block";
        hiddenBlancas.value = "personalizado";
      }
    });

    if (fichaBlancas) {
      fichaBlancas.addEventListener("change", function () {
        setAvatarBlancas(this.value);
      });
    }
    if (gifBlancas) {
      gifBlancas.addEventListener("change", function () {
        setAvatarBlancas(this.value);
      });
    }
    const campeonBlancas = document.querySelector(
      'select[name="avatar_campeon_blancas"]',
    );
    if (campeonBlancas) {
      campeonBlancas.addEventListener("change", function () {
        setAvatarBlancas(this.value);
      });
    }

    inputBlancas.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        if (nombreArchivoBlancas)
          nombreArchivoBlancas.textContent = this.files[0].name;
        mostrarPrevisualizacionAvatar(this, "avatar-display-blancas");
      }
    });
  }

  // MANEJO DE AVATARES DEL JUGADOR NEGRO (nueva estructura)
  if (tipoNegras && inputNegras && hiddenNegras) {
    const contenedorNegras = document.getElementById(
      "contenedor-personalizado-negras",
    );
    const nombreArchivoNegras = document.getElementById(
      "nombre-archivo-negras",
    );
    const contFichaNegras = document.getElementById("opciones-ficha-negras");
    const contGifNegras = document.getElementById("opciones-gif-negras");
    const contCampeonesNegras = document.getElementById(
      "opciones-campeones-negras",
    );

    function setAvatarNegras(valor) {
      hiddenNegras.value = valor || "predeterminado";
      actualizarAvatarDisplay(valor, "avatar-display-negras");
    }

    tipoNegras.addEventListener("change", function () {
      const v = this.value;
      if (contFichaNegras) contFichaNegras.style.display = "none";
      if (contGifNegras) contGifNegras.style.display = "none";
      if (contCampeonesNegras) contCampeonesNegras.style.display = "none";
      if (contenedorNegras) contenedorNegras.style.display = "none";

      if (v === "predeterminado") {
        setAvatarNegras("predeterminado");
      } else if (v === "usuario") {
        setAvatarNegras("public/imagenes/avatares/user_black.png");
      } else if (v === "ficha") {
        if (contFichaNegras) contFichaNegras.style.display = "block";
        if (fichaNegras) setAvatarNegras(fichaNegras.value);
      } else if (v === "gif") {
        if (contGifNegras) contGifNegras.style.display = "block";
        if (gifNegras) setAvatarNegras(gifNegras.value);
      } else if (v === "campeones") {
        if (contCampeonesNegras) contCampeonesNegras.style.display = "block";
        const campeonNegras = document.querySelector(
          'select[name="avatar_campeon_negras"]',
        );
        if (campeonNegras) {
          setAvatarNegras(campeonNegras.value);
        }
      } else if (v === "personalizado") {
        if (contenedorNegras) contenedorNegras.style.display = "block";
        hiddenNegras.value = "personalizado";
      }
    });

    if (fichaNegras)
      fichaNegras.addEventListener("change", function () {
        setAvatarNegras(this.value);
      });
    if (gifNegras)
      gifNegras.addEventListener("change", function () {
        setAvatarNegras(this.value);
      });
    const campeonNegras = document.querySelector(
      'select[name="avatar_campeon_negras"]',
    );
    if (campeonNegras) {
      campeonNegras.addEventListener("change", function () {
        setAvatarNegras(this.value);
      });
    }

    inputNegras.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        if (nombreArchivoNegras)
          nombreArchivoNegras.textContent = this.files[0].name;
        mostrarPrevisualizacionAvatar(this, "avatar-display-negras");
      }
    });
  }
});

// ========================================
// FUNCIONES PARA GESTIÓN DE MODALES
// ========================================

// Función para cerrar un modal por su ID
function cerrarModal(modalId) {
  // Obtenemos el modal por su ID
  const modal = document.getElementById(modalId);
  if (modal) {
    // Si es el modal de cargar inicial, eliminamos la clase mostrar
    if (modalId === "modalCargarInicial") {
      modal.classList.remove("mostrar");
    } else {
      // Para otros modales, ocultamos cambiando su display a none
      modal.style.display = "none";
    }
  }
}

// Función genérica para abrir diferentes modales de confirmación
// Soporta: eliminar, reiniciar, cargar
function abrirModalConfirmacion(tipo, opciones = {}) {
  // Variables para los diferentes tipos de modal
  let titulo = "";
  let icono = "";
  let mensaje = "";
  let bottonClass = "";
  let accionHTML = "";
  let modeloId = "modalConfirmacion";

  // Configuramos el contenido según el tipo de modal
  if (tipo === "eliminar") {
    // Modal para confirmar eliminación de partida guardada
    titulo = "⚠️ Confirmar eliminación";
    icono = "🗑️";
    mensaje = `¿Deseas eliminar la partida "<strong>${opciones.nombre}</strong>"?`;
    bottonClass = "btn-eliminar";
    const desdeInicio = opciones.desdeInicio ? true : false;

    // Usamos AJAX para ambos casos (pantalla inicial y durante el juego)
    const funcionAjax = desdeInicio
      ? "eliminarPartidaAjaxInicial"
      : "eliminarPartidaAjax";
    accionHTML = `
      <button type="button" class="btn-confirmar ${bottonClass}" onclick="${funcionAjax}('${opciones.archivo}')">${icono} Eliminar</button>
    `;

    modeloId = "modalConfirmarEliminar";
  } else if (tipo === "eliminar_todas") {
    // Modal para confirmar eliminación masiva
    titulo = "⚠️ Eliminar todas";
    icono = "🗑️";
    mensaje = "¿Deseas eliminar todas las partidas guardadas?";
    bottonClass = "btn-eliminar";
    const funcionAjax = opciones.desdeInicio
      ? "eliminarTodasPartidasAjaxInicial"
      : "eliminarTodasPartidasAjax";
    accionHTML = `
      <button type="button" class="btn-confirmar ${bottonClass}" onclick="${funcionAjax}()">${icono} Eliminar todas</button>
    `;
    modeloId = "modalConfirmarEliminarTodas";
  } else if (tipo === "reiniciar") {
    // Modal para confirmar reinicio de partida
    titulo = "🔄 Confirmar reinicio";
    icono = "🔄";
    mensaje = "¿Deseas reiniciar la partida? Perderás todo el progreso.";
    bottonClass = "btn-reiniciar-confirm";
    accionHTML = `
      <form method="post" style="display: inline;">
        <button type="submit" name="confirmar_reiniciar" class="btn-confirmar ${bottonClass}">${icono} Reiniciar</button>
      </form>
    `;
    modeloId = "modalConfirmarReiniciar";
  } else if (tipo === "cargar") {
    // Modal para confirmar carga de partida guardada
    titulo = "📁 Confirmar carga";
    icono = "📁";
    mensaje =
      "Si cargas una partida guardada, la actual se perderá. ¿Deseas continuar?";
    bottonClass = "btn-cargar-confirm";
    accionHTML = `
      <form method="post" style="display: inline;">
        <input type="hidden" name="archivo_partida" value="${opciones.archivo}">
        <button type="submit" name="cargar_partida" class="btn-confirmar ${bottonClass}">${icono} Cargar</button>
      </form>
    `;
    modeloId = "modalConfirmarCargar";
  }

  // Creamos el HTML del modal con los valores configurados
  const modalHTML = `
    <div id="${modeloId}" class="modal-overlay">
      <div class="modal-content">
        <h2>${titulo}</h2>
        <p>${mensaje}</p>
        <p class="texto-advertencia">Esta acción no se puede deshacer.</p>
        <div class="modal-buttons">
          ${accionHTML}
          <button type="button" class="btn-cancelar" onclick="cerrarModal('${modeloId}')">✖️ Cancelar</button>
        </div>
      </div>
    </div>
  `;

  // Eliminamos el modal anterior si existe
  const modalAnterior = document.getElementById(modeloId);
  if (modalAnterior) {
    modalAnterior.remove();
  }

  // Añadimos el nuevo modal al DOM
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Mostramos el modal
  const newModal = document.getElementById(modeloId);
  if (newModal) {
    newModal.style.display = "flex";
  }

  // Si es un reinicio, pausamos la partida automáticamente
  if (tipo === "reiniciar") {
    // Pausamos con AJAX sin recargar la página
    fetch("index.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "alternar_pausa=1",
    });
  }
}

// Función para mantener compatibilidad con el código existente (eliminar partida)
function abrirModalConfirmarEliminar(nombre, archivo, desdeInicio) {
  abrirModalConfirmacion("eliminar", { nombre, archivo, desdeInicio });
}

// Abre el modal para confirmar eliminación masiva
function abrirModalConfirmarEliminarTodas(desdeInicio) {
  abrirModalConfirmacion("eliminar_todas", { desdeInicio });
}

// Ajusta el estado del botón de eliminar todas según haya o no partidas
function setEstadoBotonEliminarTodas(botonId, hayPartidas) {
  const boton = document.getElementById(botonId);
  if (!boton) return;
  boton.disabled = !hayPartidas;
  boton.style.opacity = hayPartidas ? "" : "0.6";
  boton.style.cursor = hayPartidas ? "pointer" : "not-allowed";
}

// Objeto global para mantener el estado del filtrado y ordenamiento
const estadoModalPartidas = {
  modalCargar: {
    ordenActual: 0, // 0=Más recientes, 1=Más antiguas, 2=A-Z, 3=Z-A
    filtroActual: "",
  },
  modalCargarInicial: {
    ordenActual: 0,
    filtroActual: "",
  },
};

// Textos de los estados de ordenamiento
const textosOrden = [
  { icono: "🔽", texto: "Más recientes" },
  { icono: "🔼", texto: "Más antiguas" },
  { icono: "🔽", texto: "A → Z" },
  { icono: "🔼", texto: "Z → A" },
];

// Mostrar/ocultar botón de limpiar filtro
function actualizarBotonLimpiar(inputId) {
  const input = document.getElementById(inputId);
  const botonId = "btn-limpiar-" + inputId;
  const boton = document.getElementById(botonId);

  if (input && boton) {
    if (input.value.length > 0) {
      boton.classList.add("visible");
    } else {
      boton.classList.remove("visible");
    }
  }
}

// Función para limpiar el filtro
function limpiarFiltro(inputId, modalId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = "";
    actualizarBotonLimpiar(inputId);
    filtrarYOrdenarPartidas(modalId);
  }
}

// Ordenar por fecha (toggle entre recientes/antiguas)
function ordenarPorFecha(modalId) {
  const estado = estadoModalPartidas[modalId];
  const sufijo = modalId === "modalCargarInicial" ? "-inicial" : "";

  // Si ya estamos en fecha, cambiar dirección; si no, activar fecha descendente
  if (estado.tipoOrden === "fecha") {
    estado.direccion = estado.direccion === "desc" ? "asc" : "desc";
  } else {
    estado.tipoOrden = "fecha";
    estado.direccion = "desc";
  }

  // Actualizar UI
  const btnFecha = document.getElementById("btn-fecha" + sufijo);
  const btnAlfa = document.getElementById("btn-alfabetico" + sufijo);
  const textoFecha = document.getElementById("texto-fecha" + sufijo);

  if (btnFecha && btnAlfa && textoFecha) {
    btnFecha.classList.add("activo");
    btnAlfa.classList.remove("activo");
    textoFecha.textContent =
      estado.direccion === "desc" ? "Recientes" : "Antiguas";
  }

  filtrarYOrdenarPartidas(modalId);
}

// Ordenar alfabéticamente (toggle entre A-Z/Z-A)
function ordenarAlfabeticamente(modalId) {
  const estado = estadoModalPartidas[modalId];
  const sufijo = modalId === "modalCargarInicial" ? "-inicial" : "";

  // Si ya estamos en alfabético, cambiar dirección; si no, activar A-Z
  if (estado.tipoOrden === "alfabetico") {
    estado.direccion = estado.direccion === "asc" ? "desc" : "asc";
  } else {
    estado.tipoOrden = "alfabetico";
    estado.direccion = "asc";
  }

  // Actualizar UI
  const btnFecha = document.getElementById("btn-fecha" + sufijo);
  const btnAlfa = document.getElementById("btn-alfabetico" + sufijo);
  const textoAlfa = document.getElementById("texto-alfabetico" + sufijo);

  if (btnFecha && btnAlfa && textoAlfa) {
    btnFecha.classList.remove("activo");
    btnAlfa.classList.add("activo");
    textoAlfa.textContent = estado.direccion === "asc" ? "A-Z" : "Z-A";
  }

  filtrarYOrdenarPartidas(modalId);
}

// Función para filtrar y ordenar partidas
function filtrarYOrdenarPartidas(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const estado = estadoModalPartidas[modalId];
  if (!estado) return;

  // Obtener valor del filtro
  const inputId =
    modalId === "modalCargarInicial"
      ? "filtro-partidas-inicial"
      : "filtro-partidas";
  const input = document.getElementById(inputId);
  const filtro = input ? input.value.toLowerCase() : "";

  estado.filtroActual = filtro;

  // Obtener lista de partidas
  const listaPartidas = modal.querySelector(".lista-partidas");
  if (!listaPartidas) return;

  const items = Array.from(listaPartidas.querySelectorAll(".item-partida"));

  // Filtrar
  const itemsFiltrados = items.filter((item) => {
    const nombre = item
      .querySelector(".nombre-partida")
      .textContent.toLowerCase();
    const fecha = item
      .querySelector(".fecha-partida")
      .textContent.toLowerCase();
    return nombre.includes(filtro) || fecha.includes(filtro);
  });

  // Ordenar según el estado actual
  itemsFiltrados.sort((a, b) => {
    if (estado.tipoOrden === "fecha") {
      // Ordenar por fecha
      const fechaA = a.querySelector(".fecha-partida").textContent;
      const fechaB = b.querySelector(".fecha-partida").textContent;
      const resultado = fechaB.localeCompare(fechaA); // Por defecto más reciente primero
      return estado.direccion === "desc" ? resultado : -resultado;
    } else {
      // Ordenar alfabéticamente
      const nombreA = a.querySelector(".nombre-partida").textContent;
      const nombreB = b.querySelector(".nombre-partida").textContent;
      const resultado = nombreA.localeCompare(nombreB);
      return estado.direccion === "asc" ? resultado : -resultado;
    }
  });

  // Reordenar visualmente los elementos en el DOM
  itemsFiltrados.forEach((item, index) => {
    listaPartidas.appendChild(item);
  });

  // Mostrar/ocultar items según filtro
  items.forEach((item) => {
    item.style.display = itemsFiltrados.includes(item) ? "flex" : "none";
  });

  // Mostrar mensaje si no hay resultados
  let mensajeFiltro = modal.querySelector(".mensaje-filtro");
  if (itemsFiltrados.length === 0 && items.length > 0) {
    if (!mensajeFiltro) {
      mensajeFiltro = document.createElement("p");
      mensajeFiltro.className = "mensaje-filtro";
      mensajeFiltro.textContent = "📭 No se encontraron partidas";
      listaPartidas.insertAdjacentElement("afterend", mensajeFiltro);
    }
    mensajeFiltro.style.display = "block";
  } else if (mensajeFiltro) {
    mensajeFiltro.style.display = "none";
  }
}

// Actualiza la lista y mensajes del modal de partidas (general o inicial)
function actualizarModalListado(modalId, data, opciones = {}) {
  const { inicial = false } = opciones;

  const modal = document.getElementById(modalId);
  if (!modal) return;

  const modalContent = modal.querySelector(".modal-content");
  if (!modalContent) return;

  let listaPartidas = modalContent.querySelector(".lista-partidas");
  let mensajeVacio = modalContent.querySelector(".mensaje-vacio");

  const botonEliminarTodasId = inicial
    ? "btnEliminarTodasInicial"
    : "btnEliminarTodas";
  setEstadoBotonEliminarTodas(botonEliminarTodasId, data.partidas.length > 0);

  if (data.partidas.length === 0) {
    if (listaPartidas) {
      listaPartidas.remove();
    }

    if (!mensajeVacio) {
      const mensajeDiv = document.createElement("p");
      mensajeDiv.className = "mensaje-vacio";
      mensajeDiv.textContent = data.mensaje;

      const h2 = modalContent.querySelector("h2");
      h2.insertAdjacentElement("afterend", mensajeDiv);
    } else {
      mensajeVacio.textContent = data.mensaje;
    }

    return;
  }

  const html = data.partidas
    .map((partida) => {
      const nombre = escapeHtml(partida.nombre);
      const fecha = escapeHtml(partida.fecha);
      const archivo = escapeHtml(partida.archivo);

      if (inicial) {
        return `
        <div class="item-partida">
          <div class="info-partida">
            <div class="nombre-partida">${nombre}</div>
            <div class="fecha-partida">${fecha}</div>
          </div>
          <div class="acciones-partida">
            <form method="post" class="formulario-inline">
              <input type="hidden" name="archivo_partida" value="${archivo}">
              <button type="submit" name="cargar_partida_inicial" class="btn-cargar-item">📂 Cargar</button>
            </form>
            <button type="button" class="btn-eliminar-item" onclick="abrirModalConfirmarEliminar('${nombre.replace(/'/g, "\\'")}', '${archivo}', true)">🗑️</button>
          </div>
        </div>
      `;
      }

      return `
      <div class="item-partida">
        <div class="info-partida">
          <div class="nombre-partida">${nombre}</div>
          <div class="fecha-partida">${fecha}</div>
        </div>
        <div class="acciones-partida">
          <form method="post" style="display: inline;">
            <input type="hidden" name="archivo_partida" value="${archivo}">
            <button type="submit" name="cargar_partida" class="btn-cargar-item">📂 Cargar</button>
          </form>
          <button type="button" class="btn-eliminar-item" onclick="abrirModalConfirmarEliminar('${nombre.replace(/'/g, "\\'")}', '${archivo}', false)">🗑️</button>
        </div>
      </div>
    `;
    })
    .join("");

  if (!listaPartidas) {
    listaPartidas = document.createElement("div");
    listaPartidas.className = "lista-partidas";
    const h2 = modalContent.querySelector("h2");
    h2.insertAdjacentElement("afterend", listaPartidas);
  }

  listaPartidas.innerHTML = html;

  if (mensajeVacio) {
    mensajeVacio.remove();
  }
}

// Función auxiliar para escapar HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Función para eliminar una partida mediante AJAX sin recargar la página
function eliminarPartidaAjax(archivo) {
  fetch("index.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      eliminar_partida: "1",
      archivo_partida: archivo,
      ajax_eliminar: "1",
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      cerrarModal("modalConfirmarEliminar");
      actualizarModalListado("modalCargar", data, { inicial: false });
    })
    .catch((e) => console.error("Error al eliminar partida:", e));
}

// Función para eliminar una partida desde la pantalla inicial mediante AJAX
function eliminarPartidaAjaxInicial(archivo) {
  fetch("index.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      eliminar_partida_inicial: "1",
      archivo_partida: archivo,
      ajax_eliminar: "1",
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      cerrarModal("modalConfirmarEliminar");
      actualizarModalListado("modalCargarInicial", data, { inicial: true });
    })
    .catch((e) => console.error("Error al eliminar partida:", e));
}

// Función para eliminar todas las partidas (modal en partida)
function eliminarTodasPartidasAjax() {
  fetch("index.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      eliminar_todas: "1",
      ajax_eliminar: "1",
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      cerrarModal("modalConfirmarEliminarTodas");
      actualizarModalListado("modalCargar", data, { inicial: false });
    })
    .catch((e) => console.error("Error al eliminar partidas:", e));
}

// Función para eliminar todas las partidas desde la pantalla inicial
function eliminarTodasPartidasAjaxInicial() {
  fetch("index.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      eliminar_todas_inicial: "1",
      ajax_eliminar: "1",
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      cerrarModal("modalConfirmarEliminarTodas");
      actualizarModalListado("modalCargarInicial", data, { inicial: true });
    })
    .catch((e) => console.error("Error al eliminar partidas:", e));
}

// Función para abrir el modal de cargar partida desde la pantalla inicial
function abrirModalCargarInicial() {
  // Obtenemos el modal
  const modal = document.getElementById("modalCargarInicial");
  if (modal) {
    // Lo mostramos añadiendo la clase mostrar
    modal.classList.add("mostrar");
    // Inicializar estado de filtros
    inicializarFiltrosModal("modalCargarInicial");
  }
}

// Función para inicializar el estado de filtros cuando se abre un modal
function inicializarFiltrosModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const estado = estadoModalPartidas[modalId];
  if (!estado) return;

  // Resetear filtro
  const inputId =
    modalId === "modalCargarInicial"
      ? "filtro-partidas-inicial"
      : "filtro-partidas";
  const input = document.getElementById(inputId);
  if (input) {
    input.value = "";
    estado.filtroActual = "";
    actualizarBotonLimpiar(inputId);
  }

  // Establecer orden inicial: fecha descendente (más recientes)
  estado.tipoOrden = "fecha";
  estado.direccion = "desc";

  // Actualizar UI de los botones
  const sufijo = modalId === "modalCargarInicial" ? "-inicial" : "";
  const btnFecha = document.getElementById("btn-fecha" + sufijo);
  const btnAlfa = document.getElementById("btn-alfabetico" + sufijo);
  const textoFecha = document.getElementById("texto-fecha" + sufijo);
  const textoAlfa = document.getElementById("texto-alfabetico" + sufijo);

  if (btnFecha && btnAlfa) {
    btnFecha.classList.add("activo");
    btnAlfa.classList.remove("activo");
    if (textoFecha) textoFecha.textContent = "Recientes";
    if (textoAlfa) textoAlfa.textContent = "A-Z";
  }
  if (btnFecha) {
    btnFecha.classList.remove("activo", "ascendente", "descendente");
    btnFecha.classList.add("activo", "descendente");
  }

  // Aplicar filtro/orden
  filtrarYOrdenarPartidas(modalId);
}

// ========================================
// FUNCIONES PARA EXPANDIR/CONTRAER SECCIONES
// ========================================

// Función para mostrar/ocultar el historial de movimientos
function toggleHistorial() {
  // Obtenemos el contenedor del historial y el icono de toggle
  const contenido = document.getElementById("historial-contenido");
  const toggle = document.getElementById("historial-toggle");

  if (contenido && toggle) {
    if (contenido.style.display === "none") {
      // Si está oculto, lo mostramos
      contenido.style.display = "block";
      // Rotamos el icono hacia abajo
      toggle.style.transform = "rotate(180deg)";
    } else {
      // Si está visible, lo ocultamos
      contenido.style.display = "none";
      // Volvemos el icono a la posición normal
      toggle.style.transform = "rotate(0deg)";
    }
  }
}

// Función para mostrar/ocultar las instrucciones y reglas
function toggleInstrucciones() {
  // Obtenemos el contenedor de instrucciones y el icono de toggle
  const contenido = document.getElementById("instrucciones-contenido");
  const toggle = document.getElementById("instrucciones-toggle");

  if (contenido && toggle) {
    if (contenido.style.display === "none") {
      // Si está oculto, lo mostramos
      contenido.style.display = "block";
      // Rotamos el icono hacia abajo
      toggle.style.transform = "rotate(180deg)";
    } else {
      // Si está visible, lo ocultamos
      contenido.style.display = "none";
      // Volvemos el icono a la posición normal
      toggle.style.transform = "rotate(0deg)";
    }
  }
}
