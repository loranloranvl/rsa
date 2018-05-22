'use strict';
var bigInt = require("big-integer");

var RSA = {};
RSA.generate = function (keysize) {
    function random_prime(bits) {
        var min = bigInt.one.shiftLeft(bits - 1).minus(1); // min = 2^(bits - 1)
        var max = bigInt.one.shiftLeft(bits).minus(1);   // max = 2^(bits) - 1
        while (true) {
            var p = bigInt.randBetween(min, max);
            if (p.isProbablePrime(256)) return p;
        } 
    }

    var e = bigInt(65537),
        p, q, phi;

    do {
        p = random_prime(keysize / 2);
        q = random_prime(keysize / 2);
        phi = p.minus(1).multiply(q.minus(1));
    } while (bigInt.gcd(e, phi).notEquals(1));

    return {
    	n: p.multiply(q).toString(16),   
        e: e.toString(16),               
        d: e.modInv(phi).toString(16) 
    };
};

RSA.encrypt = function(m, n, e){
	return bigInt(m).modPow(e, n);
};

RSA.decrypt = function(c, d, n){
	return bigInt(c).modPow(d, n);   
};

// Node.js check
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports.RSA = RSA;
}
