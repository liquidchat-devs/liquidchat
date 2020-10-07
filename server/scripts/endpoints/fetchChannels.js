class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchChannels', (async(req, res) => {
            if(!this.app.isSessionValid(app, req, res)) { return; }
            const data = req.query;

            var channels = await this.app.db.db_fetch.fetchChannels(this.app.db, data.id);
            res.send(JSON.stringify(channels));
        }).bind(this));
    }
}

module.exports = Endpoint;