class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/createVoiceTransports', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.createVoiceTransports(req, res, req.body)
            console.log("> received voice transport creation - " + req.body.channel.id);
        }).bind(this));
    }

    async createVoiceTransports(req, res, connection) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, connection.channel.id);
        
        var consumer = await this.app.mediaFunc.createMediaTransport(channel.id);
        var producer = await this.app.mediaFunc.createMediaTransport(channel.id);
        var transports = this.app.voiceGroupTransports[channel.id];
        transports.consumer.set(user.id, consumer);
        transports.producer.set(user.id, producer);

        res.send(JSON.stringify({
            consumerData: {
                id: consumer.id,
                iceParameters: consumer.iceParameters,
                iceCandidates: consumer.iceCandidates,
                dtlsParameters: consumer.dtlsParameters
            },
            producerData: {
                id: producer.id,
                iceParameters: producer.iceParameters,
                iceCandidates: producer.iceCandidates,
                dtlsParameters: producer.dtlsParameters
            }
        }));
    }
}

module.exports = Endpoint;