document.addEventListener('DOMContentLoaded', () => {
    const fs = 250;
    const generator = new ECGGenerator(fs);
    const processor = new SignalProcessor(fs);
    const renderer = new ECGRenderer('ecgCanvas');

    let isRunning = true;
    let currentTime = 0;

    const bpmSlider = document.getElementById('bpmSlider');
    const bpmVal = document.getElementById('bpmVal');
    const ampSlider = document.getElementById('ampSlider');
    const ampVal = document.getElementById('ampVal');
    const noiseSlider = document.getElementById('noiseSlider');
    const noiseVal = document.getElementById('noiseVal');

    const humCheck = document.getElementById('humCheck');
    const wanderCheck = document.getElementById('wanderCheck');

    const btnHP = document.getElementById('btnHighPass');
    const btnLP = document.getElementById('btnLowPass');
    const btnNotch = document.getElementById('btnNotch');
    const btnPlay = document.getElementById('btnTogglePlay');
    const btnConnectSensor = document.getElementById('btnConnectSensor');
    const btnDisconnectSensor = document.getElementById('btnDisconnectSensor');

    const bpmDisplay = document.getElementById('bpmDisplay');
    const freqDisplay = document.getElementById('freqDisplay');
    const rrDisplay = document.getElementById('rrDisplay');
    const filterStatus = document.getElementById('filterStatus');
    const sensorStatus = document.getElementById('sensorStatus');
    const signalHeading = document.getElementById('signalHeading');
    const statusIndicator = document.getElementById('text-status');

    let sensorConnected = false;
    let sensorBpm = null;

    function setSensorStatus(message, state = '') {
        sensorStatus.textContent = message;
        sensorStatus.classList.toggle('connected', state === 'connected');
        sensorStatus.classList.toggle('error', state === 'error');
    }

    if (!window.isSecureContext) {
        setSensorStatus('Conexión fallida: Bluetooth requiere localhost o una página servida mediante HTTPS.', 'error');
        btnConnectSensor.disabled = true;
    } else if (!navigator.bluetooth) {
        setSensorStatus('Conexión fallida: este navegador no es compatible con Web Bluetooth. Prueba con Chrome o Edge.', 'error');
        btnConnectSensor.disabled = true;
    }

    const heartRateMonitor = new HeartRateMonitor((bpm) => {
        sensorBpm = bpm;
        generator.bpm = bpm;
        signalHeading.textContent = 'ECG simulado · sincronizado con pulsómetro';
        statusIndicator.textContent = 'PULSÓMETRO';
        setSensorStatus(`Pulsómetro conectado · ${bpm} BPM recibidos.`, 'connected');
    }, () => {
        sensorConnected = false;
        sensorBpm = null;
        generator.bpm = parseInt(bpmSlider.value, 10);
        bpmSlider.disabled = false;
        btnConnectSensor.disabled = false;
        btnDisconnectSensor.disabled = true;
        signalHeading.textContent = 'ECG simulado · fs = 250 Hz';
        statusIndicator.textContent = 'SIMULACIÓN';
        setSensorStatus('Pulsómetro desconectado. Se reanudó la frecuencia de la simulación.');
    });

    bpmSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        generator.bpm = val;
        bpmVal.textContent = val;
    });

    btnConnectSensor.addEventListener('click', async () => {
        btnConnectSensor.disabled = true;
        setSensorStatus('Selecciona tu pulsómetro en la ventana del navegador…');
        try {
            await heartRateMonitor.connect();
            sensorConnected = true;
            btnDisconnectSensor.disabled = false;
            bpmSlider.disabled = true;
            setSensorStatus(
                sensorBpm === null
                    ? 'Pulsómetro conectado. Esperando la primera medición…'
                    : `Pulsómetro conectado · ${sensorBpm} BPM recibidos.`,
                'connected'
            );
        } catch (error) {
            if (error.name === 'NotFoundError') {
                setSensorStatus('Conexión cancelada: no se seleccionó un pulsómetro. La simulación continúa.');
            } else if (error.name === 'SecurityError') {
                setSensorStatus('Conexión fallida: el navegador bloqueó Bluetooth por permisos o por una página no segura.', 'error');
            } else {
                const detail = error.message || 'No se pudo establecer comunicación con el pulsómetro.';
                setSensorStatus(`Conexión fallida: ${detail}`, 'error');
            }
            btnConnectSensor.disabled = false;
        }
    });

    btnDisconnectSensor.addEventListener('click', () => {
        heartRateMonitor.disconnect();
    });

    ampSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        generator.amplitude = val;
        ampVal.textContent = val.toFixed(1) + 'x';
    });

    noiseSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        generator.noiseLevel = val;
        noiseVal.textContent = val + '%';
    });

    humCheck.addEventListener('change', (e) => {
        generator.enableHum = e.target.checked;
    });

    wanderCheck.addEventListener('change', (e) => {
        generator.enableWander = e.target.checked;
    });

    btnHP.addEventListener('click', () => {
        processor.hpEnabled = !processor.hpEnabled;
        btnHP.classList.toggle('active', processor.hpEnabled);
        updateFilterLabel();
    });

    btnLP.addEventListener('click', () => {
        processor.lpEnabled = !processor.lpEnabled;
        btnLP.classList.toggle('active', processor.lpEnabled);
        updateFilterLabel();
    });

    btnNotch.addEventListener('click', () => {
        processor.notchEnabled = !processor.notchEnabled;
        btnNotch.classList.toggle('active', processor.notchEnabled);
        updateFilterLabel();
    });

    btnPlay.addEventListener('click', () => {
        isRunning = !isRunning;
        btnPlay.textContent = isRunning ? "Pausar / Reanudar" : "Reanudar Simulación";
    });

    function updateFilterLabel() {
        const active = [];
        if (processor.hpEnabled) active.push('HP');
        if (processor.lpEnabled) active.push('LP');
        if (processor.notchEnabled) active.push('NOTCH');

        filterStatus.textContent = active.length > 0 ? active.join(' + ') : 'INACTIVOS';
    }

    const intervalMs = 1000 / fs;

    setInterval(() => {
        if (!isRunning) return;

        currentTime += 1 / fs;

        const rawSample = generator.nextSample();
        const processedSample = processor.processSample(rawSample, currentTime);

        renderer.addSample(processedSample);
        renderer.render();

        const currentBPM = sensorConnected && sensorBpm !== null ? sensorBpm : processor.detectedBPM;
        bpmDisplay.textContent = currentBPM;

        const freqHz = (currentBPM / 60).toFixed(2);
        freqDisplay.textContent = freqHz;

        const rrSec = (60 / currentBPM).toFixed(2);
        rrDisplay.textContent = rrSec;

    }, intervalMs);
});
