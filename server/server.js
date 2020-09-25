//Import modules
const express = require('express');
const app = express();

//Setup server
const Util = require("./scripts/util")
const util = new Util(app, express)
util.setupApp()
util.setupRoutes()
util.setupServer()
util.setupSocketServer()