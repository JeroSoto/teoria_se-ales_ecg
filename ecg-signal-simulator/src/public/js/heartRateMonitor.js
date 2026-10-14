class HeartRateMonitor {
    constructor(onHeartRate, onDisconnect) {
        this.onHeartRate = onHeartRate;
        this.onDisconnect = onDisconnect;
        this.device = null;
        this.characteristic = null;
        this.handleDisconnected = this.handleDisconnected.bind(this);
        this.handleHeartRateMeasurement = this.handleHeartRateMeasurement.bind(this);
    }

    async connect() {
        if (!navigator.bluetooth) {
            throw new Error('Este navegador no ofrece Bluetooth Web. Prueba con Chrome o Edge en localhost o HTTPS.');
        }

        this.device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['heart_rate'] }]
        });
        this.device.addEventListener('gattserverdisconnected', this.handleDisconnected);

        try {
            const server = await this.device.gatt.connect();
            const service = await server.getPrimaryService('heart_rate');
            this.characteristic = await service.getCharacteristic('heart_rate_measurement');
            this.characteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateMeasurement);
            await this.characteristic.startNotifications();
        } catch (error) {
            this.device.removeEventListener('gattserverdisconnected', this.handleDisconnected);
            if (this.device.gatt.connected) this.device.gatt.disconnect();
            this.device = null;
            this.characteristic = null;
            throw error;
        }
    }

    disconnect() {
        if (this.characteristic) {
            this.characteristic.removeEventListener('characteristicvaluechanged', this.handleHeartRateMeasurement);
        }
        if (this.device && this.device.gatt.connected) {
            this.device.gatt.disconnect();
        } else {
            this.handleDisconnected();
        }
    }

    handleHeartRateMeasurement(event) {
        const data = event.target.value;
        const flags = data.getUint8(0);
        const uses16BitValue = (flags & 0x01) !== 0;
        const bpm = uses16BitValue ? data.getUint16(1, true) : data.getUint8(1);

        if (bpm > 0) this.onHeartRate(bpm);
    }

    handleDisconnected() {
        if (this.characteristic) {
            this.characteristic.removeEventListener('characteristicvaluechanged', this.handleHeartRateMeasurement);
        }
        if (this.device) {
            this.device.removeEventListener('gattserverdisconnected', this.handleDisconnected);
        }
        this.characteristic = null;
        this.device = null;
        this.onDisconnect();
    }
}
