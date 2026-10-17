# Simulación en Tiempo Real de ECG & Análisis Frecuencial (FFT)

**Asignatura:** Teoría de Señales  
**Institución:** Universidad de Manizales  
**Autores:** Jerónimo Soto Villada & Milady Cristina Guapacha Montoya  
**Licencia:** MIT  

---

## 1. Descripción del Proyecto
Este proyecto es una plataforma interactiva web y de análisis de señales desarrollada con **Node.js**, **HTML5 Canvas**, **JavaScript Vanilla** y **Python (SciPy/NumPy)**. Permite simular en tiempo real la señal bioeléctrica de un **electrocardiograma (ECG)** generado por un pulsómetro o sensor de frecuencia cardíaca, e incorporar perturbaciones reales como ruido gaussiano, interferencia de red eléctrica (60 Hz) y deriva de línea base (<0.5 Hz).

Además de la simulación interactiva en el navegador, el repositorio incluye un script en Python (`scripts/analisis_fft.py`) que calcula la **Transformada Rápida de Fourier (FFT)** de la señal y genera gráficas estáticas explicativas en la carpeta `results/`.

> **Aviso de Carácter Educativo:** Este proyecto es un desarrollo computacional con fines estrictamente pedagógicos para la asignatura de Teoría de Señales. No constituye una herramienta de diagnóstico clínico ni reemplaza equipos médicos certificados.

---

## 2. Requisitos e Instalación

### Requisitos Previos
* **Node.js** (v18.0.0 o superior)
* **Python 3** (con `numpy`, `scipy` y `matplotlib` para el análisis espectral)
* **Visual Studio Code** (recomendado)

### Instrucciones de Ejecución

1. **Instalar dependencias de Node.js e iniciar el servidor web:**
   ```bash
   npm install
   npm start
   ```
   Abre tu navegador web en `http://localhost:3000`.

### Conectar un pulsómetro Bluetooth

En la página, selecciona **Conectar pulsómetro Bluetooth** y elige un dispositivo BLE que implemente el servicio estándar **Heart Rate** (UUID `0x180D`). La lectura usa la característica estándar **Heart Rate Measurement** (`0x2A37`). El permiso de Bluetooth se solicita desde el navegador y puedes desconectar el sensor en cualquier momento.

Web Bluetooth está disponible principalmente en Chrome y Edge, y requiere un contexto seguro: `http://localhost:3000` funciona para desarrollo; para acceder desde otro dispositivo o desplegar el sitio, sirve la página mediante HTTPS. No todos los relojes exponen sus datos a aplicaciones web, aunque midan la frecuencia cardíaca.

> **Importante:** el pulsómetro transmite BPM, no una señal ECG. La aplicación muestra esos BPM medidos y los usa para ajustar el ritmo de una forma de onda ECG **sintética**; no captura ni diagnostica la actividad eléctrica real del corazón.

2. **Ejecutar el script de Análisis de Frecuencia (FFT) y Filtrado Digital:**
   ```bash
   python3 scripts/analisis_fft.py
   ```
   o mediante el script de npm:
   ```bash
   npm run analyze
   ```
   Esto generará las gráficas comparativas en el dominio del tiempo y de la frecuencia en la carpeta `results/`.

---

## 3. Fundamentos Teóricos de Señales Aplicados

### 3.1. Muestreo y Teorema de Nyquist-Shannon
Para evitar el fenómeno de *aliasing* (traslape espectral), la frecuencia de muestreo $f_s$ debe cumplir:
$$f_s \ge 2 \cdot f_{\text{máx}}$$
El contenido espectral clínico relevante del ECG se ubica entre 0.5 Hz y 100-150 Hz. El simulador y los scripts trabajan a $f_s = 250\text{ Hz}$ ($T_s = 4\text{ ms}$), cumpliendo holgadamente el criterio de Nyquist.

### 3.2. Relación entre Frecuencia Cardíaca (BPM) y Frecuencia Fundamental ($f$)
La relación matemática entre las pulsaciones por minuto (BPM) y la frecuencia fundamental del corazón en Hertz (Hz) es:
$$f (\text{Hz}) = \frac{\text{BPM}}{60}, \quad T_{\text{latido}} (s) = \frac{60}{\text{BPM}}$$
Para una frecuencia cardíaca estándar de $75\text{ BPM}$, la frecuencia fundamental es $f = 1.25\text{ Hz}$ ($T = 0.8\text{ s}$).

### 3.3. Análisis Frecuencial mediante FFT
La Transformada Discreta de Fourier (DFT) transforma la señal del dominio del tiempo $x[n]$ al dominio frecuencial $X[k]$:
$$X[k] = \sum_{n=0}^{N-1} x[n] \cdot e^{-j 2\pi \frac{k n}{N}}$$
En el espectro de magnitud $|X[k]|$, se identifican claramente:
* **Pico en $1.25\text{ Hz}$:** Frecuencia cardíaca fundamental.
* **Armónicos en $2.5\text{ Hz}, 3.75\text{ Hz}, \dots$:** Forma no sinusoidal del complejo QRS.
* **Pico en $60\text{ Hz}$:** Interferencia capacitiva de la red eléctrica.
* **Lóbulo en $<0.5\text{ Hz}$:** Deriva de la línea base respiratoria.

---

## 4. Estructura del Repositorio
* `src/server.js`: Servidor HTTP en Express.js.
* `src/public/`: Aplicación frontend en HTML5 Canvas, CSS3 y JS Vanilla.
* `scripts/analisis_fft.py`: Script de Python para cálculo de la FFT y filtros SciPy.
* `results/`: Gráficas generadas (`ecg_time_and_fft.png`, `ecg_filtering_analysis.png`).
* `docs/teoria_senales.md`: Apuntes teóricos detallados de la asignatura.
