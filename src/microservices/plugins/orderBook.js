module.exports = function orderBook(options) {

    /*
        placeOrder
        request {
            symbol: CCY1/CCY2,
            type: 'market' | 'stop' | 'limit',
            price: 0.0000,
            amount: 0,
            goodTill: null=GTC | datetime=moment
        }
        response {
            status: 'pending' | 'partfilled' | 'filled',
            created: moment.utc(),
            filled: 0,
            remaining: 0,
            positions: []
        }
    */

    this.add('role:orderBook,cmd:status', function orderStatus(request, respond) {
        respond(null, { result: 'OK' });
    });

    this.add('role:orderBook,cmd:place', function placeOrder(request, respond) {
        respond(null, { result: 'OK' });
    });

    this.add('role:orderBook,cmd:cancel', function cancelOrder(request, respond) {
        respond(null, { result: 'OK' });
    });

    this.wrap('role:orderBook', function (msg, respond) {
        this.prior(msg, respond);
    });

}
