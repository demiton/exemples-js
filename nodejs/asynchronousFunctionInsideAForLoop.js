//Source : https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
// https://stackoverflow.com/questions/34628305/using-promises-with-fs-readfile-in-a-loop
// https://daveceddia.com/waiting-for-promises-in-a-loop/
//https://mcculloughwebservices.com/2017/10/12/nodejs-request-file-parsing-readline/
/*
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

 function getImage(index) {
     var imgPath = __dirname + "/image1" + index + ".png";
     return fs.readFileAsync(imgPath);
 }

 function getAllImages() {
    var promises = [];
    // load all images in parallel
    for (var i = 0; i <= 2; i++) {
        promises.push(getImage(i));
    }
    // return promise that is resolved when all images are done loading
    return Promise.all(promises);
 }

 getAllImages().then(function(imageArray) {
    // you have an array of image data in imageArray
 }, function(err) {
    // an error occurred
 });
*/



const readline = require('readline');
const fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var csv = require('csv-parser')
//console.dir(argv);
/// pour la gestion des promesses
var Promise = require('bluebird');
var fsP = Promise.promisifyAll(require('fs'));
//console.log(argv.f)
var nameFile = argv.f;





function readFromFile(filename){



    if(fs.existsSync(filename)){
        var stats = fs.statSync(filename);
        if(stats.isFile()){
            const rl = readline.createInterface({
                input: fs.createReadStream(filename),
                crlfDelay: Infinity
              });

              rl.on('line', (line) => {
                console.log(`Line from file: ${line}`);
              });
        }else{
            console.log(filename + 'est un dossier');
        }



        }
        else{

        }

};


/******************     bad implementation  : the synchronous loop function finish before the asynchronous readline method    ************************ */
function readFromFolderWrongImplementation(folder){
        if(fs.existsSync(folder)){
            var stats = fs.statSync(folder);
            if(stats.isDirectory()){

                var filelist = [];
                walkSync(folder,filelist,'.csv');

                for( var i in filelist){
                    console.log(i+ ' Fichier : '+filelist[i]);
                    var file = filelist[i];
                    const rl = readline.createInterface({
                        input: fs.createReadStream(file),
                        crlfDelay: Infinity
                      });

                      rl.on('line', (line) => {
                        console.log(`Line from file: ${line}`);
                      });

                }
                console.log('************************* Fin traitement *************************');
            }else{
                console.log(folder+ ' est un fichier');
            }



            }
            else{

            }

 };
 /*****************************************************************************************************/

const walkSync = function(dir, filelist,ext) {
  console.log('walkSync');
    function extension3(element) {
        var extName = path.extname(element);
        return extName === '' + ext;
    };
            var path = path || require('path');
            var fs = fs || require('fs'),
                files = fs.readdirSync(dir);
            filelist = filelist || [];


            files.forEach(function(file) {
                if (fs.statSync(path.join(dir, file)).isDirectory()) {
                    filelist = walkSync(path.join(dir, file), filelist,ext);
                }
                else {

                if(path.extname(file) == ext){
                    filelist.push(path.join(dir, file));
                }

                }
            });
            return filelist;
        };











var isPaused = false;
function readFromFolder(folder){

  console.log('readFromFolder : '+ fs.existsSync(folder)+ ' type : '+ typeof(folder));
    var stats0 = fs.statSync(folder);
    console.log(' directory : '+stats0.isDirectory() +' file : '+stats0.isFile());
    if(fs.existsSync(folder)){
        var stats = fs.statSync(folder);
        if(stats.isDirectory()){
            console.log('folder : '+folder);
            var filelist = [];
            walkSync(folder,filelist,'.csv');
            // Loop on files

            loopTroughFile(filelist).then(function() {
               // you have an array of image data in imageArray
                 console.log('************************* Fin traitement *************************');
            }, function(err) {
               // an error occurred
            });
            console.log("Here");




        }else{
            console.log(folder+ ' est un fichier');
        }



        }
        else{

        }

};


function loopTroughFile(list){
    // Loop on files
console.log('loopTroughFile');
var promises = [];
    for( let i in list){
        promises.push(readAllLineFrom(list[i]));
    }

    return Promise.all(promises);
}



function readAllLineFromOLD(file){
    const rl = readline.createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity
        });

        rl.on('line', (line) => {
          console.log(`Line from file: ${line}`);
        });
}

function readAllLineFrom(file){
  console.log('readAllLineFrom');
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity
        });

      printLine(rl);
      rl.on('close', () => resolve());
  });

}

function printLine(stream){
  return new Promise((resolve) => {
      stream.on('line', (line) => {
        console.log(`Line from file: ${line}`);
      });
    })
}
/*
const j = 10;
for (let i = 0; i < j; i++) {
    asynchronousProcess(function() {
        console.log(i);
    });
}



var isPaused = false;

function firstFunction(){
    isPaused = true;
    for(i=0;i<x;i++){
        // do something
    }
    isPaused = false;
};

function secondFunction(){
    firstFunction()

    alert("Here");

    function waitForIt(){
        if (isPaused) {
            setTimeout(function(){waitForIt()},100);
        } else {
            // go do that thing
        };
    }
};


*/



readFromFile(nameFile);
readFromFolder(nameFile);
