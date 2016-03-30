module.exports = function config(options) {

    this.add('role:config', function getConfig(request, respond) {
        respond(null, { result: 'OK' });
    });

}
