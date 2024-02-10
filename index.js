const fs = require("fs");

/**
 * Einfaches Skript zum Überwachen eines Ordners
 * Man kann die Klasse entwerder extenden oder einen Callback angeben
 * 
 *      // Variante mit Callback
 *      var hotfolder = new SimpleHotfolder({
 *          input: "C:/input/xxx",
 *          callback: function(file) {
 *              // Aktion die ausgeführt wird
 *          }
 *      });
 * 
 * 
 *      // Extenden
 *      class MyHotfolder extends SimmpleHotfolder {
 *          action() {
 *              console.log('-- Eine neue Datei');
 *          }
 *      }
 * 
 *
 */
module.exports = class {

    /**
     * Zum Erstellen
     * 
     * 
     * @param {Object} options 
     * @param {String} options.appTitle Name der Anwendung
     * @param {String} options.file Hier kann eine Konfigurations-Datei angeben werden
     * @param {String|Array} options.input Der Ordner der überwacht werden soll. Kann ein 
     * @param {Bollean|Function} options.callback Ein Callback der ausgeführt werden kann
     * 
     */
    constructor(options) {

        var me = this;

        me.counter = 0;

        options = options || {};
        options.file = options.file || false;

        // Datei auslesen
        var fileConfig = me.getConfig(options.file);

        // Config mergen
        me.options = Object.assign({
            appTitle: 'Simple Hotfolder',
            appVersion: '1.0',
            appAuthor: 'Tobias Pitzer / Bürosystemhaus Schäfer GmbH & Co. KG',
            extension: false,
            regex: false,
            autoDelete: false,
            input: false,
            start: true,
            callback: false
        }, fileConfig, options);

        // Prüfe das das Input Verzeichnis angegeben ist
        if (!me.options.input) {
            throw "Kein Verzeichnis zum Überwachen angegeben!"
        }

        if (!me.isDir(me.options.input)) {
            throw "Ungültiges Input Verzeichnis: " + me.options.input;
        }

        // Extension
        me.options.extension = (me.options.extension) ? ((Array.isArray(me.options.extension)) ? me.options.extension : [me.options.extension]) : false;

        // To Lower Case Konvertieren
        if (me.options.extension) {
            me.options.extension.forEach((value, index) => {
                me.options.extension[index] = value.toLowerCase();
            });
        }

        console.log(me.options);

        if (me.options.start) {
            me.start();
        }
    }


    /**
     * Kann eine Config Datei auslesen
     * 
     * @param {Boolean|String} file `false` oder der Pfad zur Config Datei
     * @returns {Object}
     */
    getConfig(file) {

        var me = this;

        var result = {};

        // Prüfen ob es eine Datei gibt
        if (file) {

            // Config Datei übernehmen
            result = JSON.parse(fs.readFileSync(file, "utf8"));
        }

        // Rückgabe
        return result;
    }



    /**
     * Start
     *
     */
    start() {

        // Read Counter
        var me = this;

        // Log Header
        console.log();
        console.log(`😎 \x1b[33m${me.options.appTitle}\x1b[0m`);
        console.log(`   ├── Version ${me.options.appVersion}`);
        console.log(`   └── by ${me.options.appAuthor}`);
        console.log();

        me.watch();
    }

    /**
     * Read Config
     *
     */
    getConfig(config) {
        // Read Counter
        var me = this;

        // Wenn die Config definiert ist
        if (typeof config != "undefined") {

            // Wenn die Config bereits ein Objekt ist
            if (typeof config == "object") {

                // Dannn die Config direkt wieder übernehmen
                me.config = config;

                // Wenn die Config ein String ist
            } else if (typeof config == "string") {
                // Prüfen ob es ein Config-File ist
                if (me.isFile(config)) {
                    // Config File
                    me.config = JSON.parse(fs.readFileSync(config, "utf8"));
                }
            }
        }
    }

    /**
     * Funktion zum Verarbeiten aller Dateien
     *
     *
     * @param {*} cb
     */
    all(cb) {

        console.log("> Process all Files");

        me = this;

        var i = 0;

        // Alle Dateien Scannen
        fs.readdir(me.config.input, (err, files) => {
            // Jede Datei verarbeiten
            files.forEach((file) => {

                // Verarbeitung starten
                me.processScan(file);

                i++;
            });

            // Wenn es keine Dateien gibt / gab
            if (i == 0) {
                console.log("> No Files to Process");
            }

            console.log();

            // Callback, dass die Funktion fertig ist
            cb();
        });
    }

    /**
     * Die eigentliche Verarbeitung der Datei.
     * Wird von der All- und Watch-Funktion aufgerufen
     *
     * @param {String} file Dateiname ohne Verzeichnis
     */
    processScan(file) {

        var me = this;

        console.log();
        console.log("⚡ Datei >" + file + "<");

        // Prüfe ob diese Dateiendung verarbeitet werden soll
        if (!me.checkExtension(file)) {
            return false;
        }

        // Prüfe ob die Datei einem RegEx entspricht
        if (!me.checkRegex(file)) {
            return false;
        }

        // Alles in eine Try-Catch packen, damit an dieser Stelle nichts kaputt geht
        try {

            // Check File is Ready
            me.checkFileReady(me.options.input + "/" + file, function (isReady) {

                // Hier findete dann die eigentliche Magie statt
                if (isReady) {

                    var fileInfo = me.getFileInfo(file)

                    // Pre Action
                    var checkPreAction = me.preAction();

                    if(checkPreAction) {

                        fileInfo.fullPath = me.options.input + "/" + file;

                        if (typeof me.options.callback == 'function') {

                            me.options.callback(fileInfo, function(more) {
                                me.afterAction(fileInfo, more);
                            });

                        } else {

                            // Action ausführen
                            me.action(fileInfo, function (more) {
                                me.afterAction(fileInfo, more);
                            });
                        }
                    }

                    // Wenn die Datei nicht mehr gefunden wurde
                } else {
                    console.log("       └── Die Datei wurde bereits gelöscht");
                }
            });

        } catch (ex) {

            // Exception abfangen
            console.log(ex);
        }
    }

    checkExtension(file) {
        var me = this;

        var checked = true;

        if (me.options.extension) {
            var fileInfo = me.getFileInfo(file);

            if (me.options.extension.indexOf(fileInfo.ext.toLowerCase()) >= 0) {
                console.log(`   ├── Dateiendung ${fileInfo.ext.toLowerCase()} wurde geprüft und wird verarbeitet`);
            } else {

                checked = false;

                if (me.options.autoDelete) {
                    console.log(`   ├── .${fileInfo.ext.toLowerCase()} Datei wird nicht verarbeitet und gelöscht`);
                    me.deleteFile(me.options.input + "/" + file);
                } else {
                    console.log(`   └── .${fileInfo.ext.toLowerCase()} Datei wird nicht verarbeitet`);
                }
            }
        }

        return checked;
    }

    /**
     * Hier kann noch eine RegEx geprüft werden
     * @param {*} file 
     * @returns 
     */
    checkRegex(file) {
        var me = this;

        if (me.options.regex) {
            // var regex = /^[\s\S]*.(txt|pdf)/g;

            // // Prüfen ob es sich um eine Datei handelt, die kopiert werden soll;
            // if (file.toLowerCase().match(regex)) {
        }

        return true;
    }

    /**
     * Gibt alle Infos zur Datei zurück
     * 
     * @param {*} file 
     */
    getFileInfo(file) {
        var me = this;

        var split = file.split('.');
        var ext = split.pop();
        var plain = split.join('.');

        // Rückgabe
        var obj = {
            fullName: file,
            plain: plain,
            ext: ext
        }

        // Objekt zurückgeben
        return obj;
    }



    /**
     * Prüft ob eine Datei bereit ist.
     * Dies ist notwendig, da die Datei schon beim schreiben des ersten Bytes hier auftaucht, dann aber noch nicht vollständig geschrieben wurde.
     * Erst wenn der Prozess der die Datei erstellt, diese Datei wieder frei gibt, dann ruft diese Funktion den entsprechenden Callback auf.
     *
     * @param {String} path Vollständiger Pfad zu Datei `/etc/some/myfile.pdf`
     * @param {Function} callback Der Callback der ausgführt wird. Hat als Parameter `true` oder `false` wenn die Datei ready ist
     */
    checkFileReady(path, callback) {
        var me = this;



        // Prüfen ob die Datei Lesbar ist
        fs.open(path, "r+", function (err, fd) {

            // Wenn die Datei noch in Bearbeitung ist
            if (err && err.code === "EBUSY") {

                console.log("   ├── 🔒 Datei ist gesperrt");

                setTimeout(function () {
                    me.checkFileReady(path, callback);
                }, 500);

                // Wenn die Datei gelöscht wurde
            } else if (err && err.code === "ENOENT") {

                console.log("   └── 🗑️ Datei existiert nicht mehr");
                callback(false);

                // Wenn die Datei verfügbar ist
            } else {

                fs.close(fd, function () {
                    console.log("   ├── 🔓 Datei ist nicht mehr gesperrt");
                    callback(true);
                });
            }
        });
    }

    preAction() {
        return true;
    }

    /**
     * Diese Aktion wird für jede Datei ausgeführt
     */
    action(fileInfo, callback) {

        var me = this;

        console.log("   ├── 🤷 Hier kann eine Action definiert sein");

        callback();
    }

    afterAction(fileInfo) {
        
        var me = this;

        if (me.options.autoDelete) {
            console.log(`   ├── ✅ Datei wurde vollständig verarbeitet und wird jetzt gelöscht`);
            me.deleteFile(fileInfo.fullPath);
        } else {
            console.log(`   └── ✅ Datei wurde vollständig verarbeitet`);
        }

    }


    /**
     * Dieser Task startet die Überwachung.
     * Er reagiert, sobald ein Rename-Event stattgefunden hat.
     *
     */
    watch() {

        var me = this;

        console.log();
        console.log("> ⏰ Start Watch");

        fs.watch(me.options.input, (eventType, filename) => {
            if (eventType == "rename" && me.isFile(me.options.input + "/" + filename)) {
                console.log();
                console.log("📂 Input");
                me.processScan(filename);
            }
        });
    }

    /**
     * Hier wird geprüft ob es sich um eine Datei handelt.
     *
     * @param {String}
     *  Vollständiger Pfad zur Datei
     * @returns {Boolean} `true` wenn es eine Datei ist, `false` wenn nicht
     */
    isFile(path) {
        return fs.existsSync(path) && fs.lstatSync(path).isFile();
    }

    isDir(dir) {
        return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();
    }

    deleteFile(file) {
        var me = this;

        me.checkFileReady(file, function (ready) {
            if (ready) {
                console.log("   └── 🗑️  Datei wurde gelöscht");
                fs.unlinkSync(file);
            }
        });
    }


};
