class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchServer', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var server = await this.app.db.db_fetch.fetchServer(this.app.db, data.id);

            if(server === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else {
                res.send(JSON.stringify(server))
            }
        }).bind(this));
    }
}

module.exports = Endpoint;