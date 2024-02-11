# Simple Hotfolder
Einfache Hotfolder Node JS Applikation zum beliebigen erweitern



Beispiel

```JS

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

```

```JS

const SimmpleHotfolder = require("./index.js");

class MyHotfolder extends SimmpleHotfolder {
    action() {
        console.log('-- Eine neue Datei');
    }
}

```