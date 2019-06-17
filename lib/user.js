const fs = require('fs');

var nor ;

exports.registerUser = function (name) {
    nor = name;
}

exports.printUser = function () {
    console.log(nor);
}