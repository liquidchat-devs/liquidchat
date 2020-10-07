module.exports = {
    handle(app) {
        app.post('/editUser', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await app.epFunc.editUser(app, req, res, req.body);
            console.log("> received user update - " + req.body.email);
        });
    }
}