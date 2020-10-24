class Endpoint2 {
    constructor(app) {
        this.app = app;
    }

    async createMediaWorker() {
        var worker = await this.app.mediasoup.createWorker();
        worker.on('died', () => {
            console.error('[MEDIASOUP] Media worker(pid: ' + worker.pid + ') died!');
        });

        this.app.mediaWorkers.push(worker);
        return worker;
    }

    async createMediaTransport(channelID) {
        var router = this.app.voiceGroupRouters.get(channelID);
        var transport = await router.createWebRtcTransport();

        return transport;
    }
}

module.exports = Endpoint2;