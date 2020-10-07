class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.post('/editUser', async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }

            await this.app.epFunc.editUser(req, res, req.body);
            console.log("> received user update - " + req.body.email);
        });
    }
}