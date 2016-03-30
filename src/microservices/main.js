var os = require('os');
var jsonfile = require('jsonfile');
var seneca = require('seneca')();

function _initServices(config) {
    console.log(config);
    Object.keys(config.services).forEach(function(key) {
        var serviceConfig = config.services[key];
        serviceConfig.pin = 'role:' + key;
        seneca.use('plugins/' + key).listen(serviceConfig);
    });
};

jsonfile.readFile(__dirname + '/config/' + os.hostname().toLowerCase() + '.json', function(err, config) {
    if(err) {
        console.log(err);
        jsonfile.readFile(__dirname + '/config/_default.json', function(err, config) {
            if(err) {
                console.log(err);
                process.exit(1);
            }
            else {
                _initServices(config);
            }
        });
    }
    else {
        _initServices(config);
    }
});
