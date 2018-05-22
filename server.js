var express = require('express');
var app = express();
var fs = require('fs');
var RSA = require('./rsa.js').RSA;
var bodyParser = require('body-parser');
var bigInt = require("big-integer");

app.use(bodyParser.json());

app.get('/', function(req, res) {
	fs.readFile('rsa.html', function(err, data) {
	    res.writeHead(200, {'Content-Type': 'text/html'});
	    res.write(data);
	    res.end();
	});
})

app.get('/keygen/:keysize', function(req, res) {
	console.log('Generating keys');
	var keysize = parseInt(req.params.keysize);
	var keys = RSA.generate(keysize);
	keys['keysize'] = keysize;
	var resJSON = {
		status: 200,
		data: keys
	};
	res.send(JSON.stringify(resJSON));
});

function stickZeros(str, len) {
	var zeros = '';
	for (var i = 0; i < len - str.length; ++i) {
		zeros += '0';
	}
	return zeros + str;
}

function encodeHex(s, ratio) {
	var text = encodeURI(s);
	var len = text.length;
	var unit = 16 * ratio;
	for (var i = 0; i < (unit - len % unit) % unit; ++i) {
		text += ' ';
	}
	var result = '';
	for (var i = 0; i < text.length; ++i) {
		var rawHex = text.charCodeAt(i).toString(16);
		result += rawHex;
	}
	return result;
}

function decodeHex(s) {
	var result = ''
	for (var i = 0; i < s.length; i += 2) {
		var byte = s.slice(i, i + 2);
		var ascii = parseInt(byte, 16);
		result += String.fromCharCode(ascii);
	}
	console.log(result);
	return decodeURI(result);
}

app.post('/enc', function(req, res) {
	var ratio = parseInt(req.body.keysize) / 128;
	var e = bigInt(req.body.e, 16);
	var n = bigInt(req.body.n, 16);
	var blocks = encodeHex(req.body.inp, ratio);
	var result = '';
	var blocksize = 32 * ratio;
	for (var i = 0; i < blocks.length; i += blocksize) {
		var m = bigInt(blocks.slice(i, i + blocksize), 16);
		result += stickZeros(RSA.encrypt(m, n, e).toString(16), blocksize);
	}
	res.send(JSON.stringify({
		status: 200,
		data: result
	}));
	console.log({
		p1: req.body.inp,
		p2: blocks,
		p3: result
	});
});

app.post('/dec', function(req, res) {
	var ratio = parseInt(req.body.keysize) / 128;
	var d = bigInt(req.body.d, 16);
	var n = bigInt(req.body.n, 16);
	var blocks = req.body.inc;
	var result = '';
	var blocksize = 32 * ratio;
	for (var i = 0; i < blocks.length; i += blocksize) {
		var c = bigInt(blocks.slice(i, i + blocksize), 16);
		result += stickZeros(RSA.decrypt(c, d, n).toString(16), blocksize);
	}
	res.send(JSON.stringify({
		status: 200,
		data: decodeHex(result)
	}));
	console.log({
		p3: blocks,
		p4: result,
		p5: decodeHex(result)
	})
});

app.use(express.static('.'));

app.listen(3000, () => console.log('Server initialized'));