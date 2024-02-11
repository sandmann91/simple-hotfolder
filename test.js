const SimpleHotfolder = require("./index.js");

// Hotfolder
var hotfolder = new SimpleHotfolder({
    input: './input',
    extension: 'txt',
    autoDelete: true,
    callback: function (file, callback) {
        console.log();
        console.log(file);
        callback();
    }
});