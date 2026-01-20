<!-- MODAL DE CONFIGURACIÓN (para personalizar opciones visuales de la partida -->
<div id="modalConfiguracion" class="modal">
  <div class="modal-content">
    <!-- Encabezado del modal con título -->
    <div class="modal-header">
      <h2>⚙️ Configuración</h2>
    </div>
    <!-- Formulario para cambiar las configuraciones -->
    <form method="post" class="modal-form">
      <!-- Campo oculto que marca que queremos guardar configuración -->
      <input type="hidden" name="guardar_configuracion" value="1">

      <!-- 1ª SECCIÓN: Opciones de Interfaz Visual -->
      <div class="config-section">
        <h3>Opciones de Interfaz</h3>
        <p class="config-description">Puedes mostrar u ocultar elementos visuales</p>

        <!-- Opción para mostrar/ocultar coordenadas del tablero -->
        <div class="config-option checkbox">
          <label>
            <!-- Casilla de verificación (si estaba marcada, la deja marcada) -->
            <input type="checkbox" name="mostrar_coordenadas" <?php echo $_SESSION['config']['mostrar_coordenadas'] ? 'checked' : ''; ?>>
            Coordenadas del tablero (A-H, 1-8)
          </label>
        </div>

        <!-- Opción para mostrar/ocultar panel de piezas capturadas -->
        <div class="config-option checkbox">
          <label>
            <!-- Casilla de verificación (si estaba marcada, la deja marcada) -->
            <input type="checkbox" name="mostrar_capturas" <?php echo $_SESSION['config']['mostrar_capturas'] ? 'checked' : ''; ?>>
            Panel de piezas capturadas
          </label>
        </div>

        <!-- Opción para configurar movimientos a deshacer -->
        <div class="config-option">
          <label>Movimientos permitidos a deshacer:</label>
          <select name="max_movimientos_deshacer" class="select-config">
            <option value="0" <?php echo (isset($_SESSION['config']['max_movimientos_deshacer']) && $_SESSION['config']['max_movimientos_deshacer'] == 0) ? 'selected' : ''; ?>>Ninguno (sin posibilidad de deshacer)</option>
            <option value="1" <?php echo (isset($_SESSION['config']['max_movimientos_deshacer']) && $_SESSION['config']['max_movimientos_deshacer'] == 1) ? 'selected' : ''; ?>>1 movimiento</option>
            <option value="2" <?php echo (isset($_SESSION['config']['max_movimientos_deshacer']) && $_SESSION['config']['max_movimientos_deshacer'] == 2) ? 'selected' : ''; ?>>2 movimientos</option>
            <option value="3" <?php echo (isset($_SESSION['config']['max_movimientos_deshacer']) && $_SESSION['config']['max_movimientos_deshacer'] == 3) ? 'selected' : ''; ?>>3 movimientos</option>
            <option value="4" <?php echo (isset($_SESSION['config']['max_movimientos_deshacer']) && $_SESSION['config']['max_movimientos_deshacer'] == 4) ? 'selected' : ''; ?>>4 movimientos</option>
            <option value="5" <?php echo (isset($_SESSION['config']['max_movimientos_deshacer']) && $_SESSION['config']['max_movimientos_deshacer'] == 5) ? 'selected' : ''; ?>>5 movimientos</option>
            <option value="6" <?php echo (isset($_SESSION['config']['max_movimientos_deshacer']) && $_SESSION['config']['max_movimientos_deshacer'] == 6) ? 'selected' : ''; ?>>6 movimientos</option>
            <option value="7" <?php echo (isset($_SESSION['config']['max_movimientos_deshacer']) && $_SESSION['config']['max_movimientos_deshacer'] == 7) ? 'selected' : ''; ?>>7 movimientos</option>
            <option value="8" <?php echo (isset($_SESSION['config']['max_movimientos_deshacer']) && $_SESSION['config']['max_movimientos_deshacer'] == 8) ? 'selected' : ''; ?>>8 movimientos</option>
            <option value="9" <?php echo (isset($_SESSION['config']['max_movimientos_deshacer']) && $_SESSION['config']['max_movimientos_deshacer'] == 9) ? 'selected' : ''; ?>>9 movimientos</option>
            <option value="10" <?php echo (isset($_SESSION['config']['max_movimientos_deshacer']) && $_SESSION['config']['max_movimientos_deshacer'] == 10) ? 'selected' : ''; ?>>10 movimientos (máximo)</option>
          </select>
        </div>
      </div>

      <!-- 2ª SECCIÓN: Información de Tiempo (informativo, no editable) -->
      <div class="config-info">
        <h3>⏱️Información del Tiempo</h3>
        <!-- Mostramos el tiempo inicial configurado en la partida actual -->
        <p>
          <strong>Tiempo inicial:</strong>
          <?php
          // Si es sin tiempo lo indicamos
          if (isset($_SESSION['config']['sin_tiempo']) && $_SESSION['config']['sin_tiempo']) {
            echo '♾️ Sin límite de tiempo';
          } else {
            // Convertimos segundos a minutos y mostramos la unidad correcta (minuto/minutos)
            $mins = $_SESSION['config']['tiempo_inicial'] / 60; // Convertimos a minutos
            echo $mins . ' minuto' . ($mins != 1 ? 's' : ''); // Mostramos con plural si es necesario
          }
          ?>
        </p>

        <!-- Mostramos el incremento Fischer (tiempo extra por movimiento) -->
        <p>
          <strong>➕Incremento Fischer:</strong>
          <?php
          // Si hay incremento lo mostramos, si no decimos "Sin incremento"
          echo $_SESSION['config']['incremento'] > 0
            ? '+' . $_SESSION['config']['incremento'] . ' segundo' . ($_SESSION['config']['incremento'] != 1 ? 's' : '')
            : 'Sin incremento';
          ?>
        </p>

        <!-- Nota informativa sobre que el tiempo no se puede cambiar durante la partida -->
        <small class="config-note">
          ℹ️El tiempo y el incremento no se pueden cambiar durante la partida
        </small>
      </div>

      <!-- 3ª SECCIÓN: Botones de acción -->
      <div class="modal-buttons">
        <!-- Botón para guardar los cambios realizados en la configuración -->
        <button type="submit" name="guardar_configuracion" class="btn-guardar-config">💾 Guardar Cambios</button>
        <!-- Botón para cerrar sin guardar cambios -->
        <button type="button" class="btn-cancelar-config">❌ Cancelar</button>
      </div>
    </form>
  </div>
</div>