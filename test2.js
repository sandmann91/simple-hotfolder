const SimmpleHotfolder = require("./index.js");



class MyHotfolder extends SimmpleHotfolder {
    action() {
        console.log('-- Eine neue Datei');
    }
}


/**
 * 
 * 
 *  console.log(
                        "       ├──  Do Something with the File for Example move it"
                    );

                    //Referenzname für identischen Zeitstempel
                    let NewFileName = me.options.output + "/" + Date.now() + "_" + file;

                    //Umbenennen und verschieben der Datei
                    fs.renameSync(
                        me.options.input + "/" + file,
                        NewFileName
                    );

                    //Druckerauswahl
                    const options = {
                        printer: "aule_lieferschein_1",
                    };

                    //Drucken der File
                    pdfToPrinter.print(NewFileName, options);

                    console.log("       └── Moved File");
 */