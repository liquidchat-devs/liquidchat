class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchNote', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var note = await this.app.db.db_fetch.fetchNote(this.app.db, data.id);
            if(note === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else if(note.author.id !== user.id) {
                res.send(JSON.stringify({ status: -2 }))
            } else {
                res.send(JSON.stringify(note))
            }
        }).bind(this));
    }
}

module.exports = Endpoint;