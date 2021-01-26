class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/auth_osu', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
            var data = req.query;

            //https://osu.ppy.sh/oauth/authorize?client_id=4883&redirect_uri=http://localhost:8080/auth_osu&response_type=code&scope=public
            this.app.axios.post("https://osu.ppy.sh/oauth/token",
            "client_id=" + this.app.config["auth_osu_id"] + "&client_secret=" + this.app.config["auth_osu_token"] + "&code=" + data.code + "&grant_type=authorization_code&redirect_uri=http://localhost:8080/auth_osu",{
                headers: { "Accept": "application/json" }
            }).then(res1 => {
                if(res1.data["access_token"] !== undefined) {
                    this.app.axios.get("https://osu.ppy.sh/api/v2/me", {
                        headers: { "Authorization": "Bearer " + res1.data["access_token"] }
                    }).then(res2 => {
                        this.app.epFunc.editUser(req, res, { "osu_token": res1.data["access_token"], "osu_username": res2.data.username });
                    });
                } else {
                    res.sendStatus(401)
                }
            });
        }).bind(this));
    }
}

module.exports = Endpoint;