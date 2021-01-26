class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/auth_spotify', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
            var data = req.query;

            //https://accounts.spotify.com/authorize?client_id=d10fc3159d9c4c3ea3c307df4b04ca43&redirect_uri=https://nekonetwork.net:8080/auth_spotify&response_type=code
            this.app.axios.post("https://accounts.spotify.com/api/token",
            "code=" + data.code + "&grant_type=authorization_code&redirect_uri=https://nekonetwork.net:8080/auth_spotify&scope=openid",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + Buffer.from(this.app.config["auth_spotify_id"] + ":" + this.app.config["auth_spotify_token"]).toString("base64"),
                }
            }).then(res1 => {
                if(res1.data["access_token"] !== undefined) {
                    this.app.axios.get("https://api.spotify.com/v1/me", {
                        headers: {
                            "Authorization": "Bearer " + res1.data["access_token"]
                        }
                    }).then(res2 => {
                        this.app.epFunc.editUser(req, res, { "spotify_token": res1.data["access_token"], "spotify_username": res2.data["display_name"] });
                    });
                } else {
                    res.sendStatus(401)
                }
            });
        }).bind(this));
    }
}

module.exports = Endpoint;