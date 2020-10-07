class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.post('/login', async(req, res) => {
            const data = req.body;
            switch(data.authType) {
                case "autologin":
                    if(!this.app.sessions.has(req.cookies["sessionID"])) {
                        res.send(JSON.stringify({ status: -3 }))
                    } else {
                        res.send(JSON.stringify(this.app.sessions.get(req.cookies["sessionID"])));
                    }
                    break;
        
                case "default":
                    var user = await this.app.db.db_fetch.fetchUserByUsername(this.app.db, data.username, true, true);
                    
                    if(user === undefined) {
                        res.send(JSON.stringify({ status: -2 }))
                    } else if(this.app.bcrypt.compareSync(data.password, user.password.toString()) == false) {
                        res.send(JSON.stringify({ status: -1 }))
                    } else {
                        const sessionID = this.app.crypto.randomBytes(16).toString("hex");
                        const session = {
                            id: sessionID,
                            userID: user.id,
                            status: 1
                        }
                
                        this.app.sessions.set(sessionID, session);
                        if(this.app.userSessions.has(user.id)) {
                            this.app.userSessions.get(user.id).push(sessionID);
                        } else {
                            this.app.userSessions.set(user.id, [ sessionID ]);
                        }

                        res.cookie("sessionID", session.id, {
                            sameSite: "None"
                        });
                        res.send(JSON.stringify(session));  
                    }
                    break;
            }
        })
    }
}

module.exports = Endpoint;