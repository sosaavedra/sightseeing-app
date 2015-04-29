var     config      = require('./config.json'), //global configuration file
        express     = require('express'),
        app         = express(),
        root        = __dirname,
        routes      = (require('./modules/routes'))(config, express, app, root);


app.listen(3000, function() {
    console.log('NodeJS listening on port 3000');
});