class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/auth_gh', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
            var data = req.query;

            //https://github.com/login/oauth/authorize?client_id=91bcd730211830731d9a
            this.app.axios.post("https://github.com/login/oauth/access_token?client_id=" + this.app.config["auth_gh_id"] + "&client_secret=" + this.app.config["auth_gh_token"] + "&code=" + data.code, {}, {
                headers: { "Accept": "application/json" }
            }).then(res1 => {
                if(res1.data["access_token"] !== undefined) {
                    this.app.axios.get("https://api.github.com/user", {
                        headers: { "Authorization": "token " + res1.data["access_token"] }
                    }).then(res2 => {
                        this.app.epFunc.editUser(req, res, { "gh_token": res1.data["access_token"], "gh_username": res2.data.login });
                    });
                } else {
                    res.sendStatus(401)
                }
            });
        }).bind(this));
    }
}

module.exports = Endpoint;