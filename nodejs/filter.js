
const readline = require('readline');
//const fs = require('fs');
const fs = require('fs-extra');
var argv = require('minimist')(process.argv.slice(2));
var csv = require('csv-parser')
//console.dir(argv);
/// pour la gestion des promesses
var Promise = require('bluebird');
var fsP = Promise.promisifyAll(require('fs'));
//console.log(argv.f)
var nameFile = argv.f;
var configJSON = argv.j;

const path = require('path');

var replaceExt = require('replace-ext'); // pour changer l'extension

console.log(' foldername : '+ nameFile+' Json : '+configJSON);



var xlsx = require('node-xlsx');



//looping through all sheets

function parseXlSX(filename){
    console.log('parseXlSX');
    var obj = xlsx.parse(filename); // parses a file
    var rows = [];
    for(var i = 0; i < obj.length; i++)
    {
        var sheet = obj[i];
      //  console.log(sheet)
    //loop through all rows in the sheet
    for(var j = 0; j < sheet['data'].length; j++)
    {
        //add the row to the rows array

        rows.push(sheet['data'][j]);
    }
    }
  //  console.log(rows.length);

    for ( var i in rows){
    // console.log(rows[i]);
    }
    return rows;
}

function indexHeaders(list,key){

    return list.indexOf(key);
}

function lineComparison(headers,line1,line2){
    var key = 'NUM_SEQ_CT';
    var index =  indexHeaders(headers,key );
    if(line1[index]==line2[index]){
        console.log('true : ' + line1[index]);
        return true;
    }
    else{
        return false;
    }
    
};

function filterFile(filename, configfile){
    var result = [];

    if(filename != undefined){
        if(configfile != undefined){
        var tab = parseXlSX(filename);
            
        let jsondata = fs.readFileSync(configfile);  
        let jsonconf = JSON.parse(jsondata); 
        for( var key in jsonconf){
       //  console.log('key : ' + key + ' value '+jsonconf[key]); 
        } 
      //  console.log(tab[0][0]);
        let headers = tab[0];
        result.push(headers);
        
        var oldLine=[];
        for( var l in tab){
            var newLine = tab[l];
            var isLinked = lineComparison(headers,oldLine,newLine);

              //  console.log(tab[l]);
            for (var key in jsonconf ){
                var index =  indexHeaders(headers,key );
                if(index != -1){
                      console.log(" l'attribut "+ index +" "+ key +" est présent"); 
                if(tab[l][index] == jsonconf[key]){
                         result.push(tab[l]);
                         console.log('******* push ******');
                         console.log('tab : ' + tab[l]); 
                }
                else if(isLinked){
                   result.push(tab[l]);
                         console.log('******* push ******');
                         console.log('tab : ' + tab[l]); 
                }else{
               //     console.log('not match');
                }
            }
            else{ 
                //console.log(" l'attribut "+ index +" "+ key +" est introuvable")
        }
             
            }
        oldLine = tab[l];
        } 
        console.log( "return result, size : "+ result.length);
        return result ;
        }
    else{
        console.log(configfile+ ' fichier json introuvable');
    }

    }else{
        console.log( ' fichier introuvable');
    }
  

}

 
function writeResult(filename,list,callback){
    var rootPath = process.cwd();
    console.log(" writeResult pour "+ filename);
    //console.log(" rootPath "+ rootPath + " directoryFile : "+directoryFile);
    var pp = filename.split(path.sep);            
    var parentDirectory = pp[pp.length - 2];
    var directoryFile = pp[pp.length - 2]+'\\';
    console.log(" rootPath "+ rootPath + " directoryFile : "+directoryFile);
    var resultPath = rootPath + '\\Data\\'+directoryFile;
    console.log("ResultPath "+ resultPath);
  //  console.log(' path '+resultPath+ " existence : "+fs.existsSync(resultPath));
        fs.ensureDir(resultPath)
            .then(() => {
              //  console.log('success!')
                var writeStr ='';
             //   console.log('list size : '+list.length)
                if(list.length >1){
                    for(var i = 0; i < list.length; i++)
                    {
                    writeStr += list[i].join(";") + "\n";
                }
            // fs.writeFile(__dirname + "/test.csv", writeStr, function(err) {
         
                //var relativePath = path.relative(process.cwd(), someFilePath);
                var filenameBase = replaceExt(path.basename(filename), '.csv');
                 console.log('filename path :   ' + filename);
                 

                var destinationFile = resultPath + filenameBase;
                fs.writeFile(destinationFile, writeStr,'ascii', function(err) {
                    if(err) {
                        return console.log(err);
                        }
             //   console.log(destinationFile+" was saved in the current directory!");
                callback();
                });
            }
            else{
             //   console.log("aucun résultat pour : "+filename);
                callback();
            }
                
                })
                .catch(err => {
                console.error(err)
                })   
}

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

const walkSync = function(dir, filelist,ext) {
  //console.log('walkSync');
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

function readFromFolderAndFilter(folder,jsonfile){

  console.log('readFromFolderAndFilter : '+ fs.existsSync(folder)+ ' type : '+ typeof(folder));
    var stats0 = fs.statSync(folder);
    console.log(' directory : '+stats0.isDirectory() +' file : '+stats0.isFile());
    if(fs.existsSync(folder)){
        var stats = fs.statSync(folder);
        if(stats.isDirectory()){
            console.log('folder : '+folder);
            var filelist = [];
            walkSync(folder,filelist,'.xlsx');
            // Loop on files

            loopTroughFileAndFilter(filelist,jsonfile).then(function() {
               // you have an array of image data in imageArray

               for(var i in filelist){
                   console.log('contenu : '+filelist[i]);
               }
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

function loopTroughFileAndFilter(list,jsonfile){
    // Loop on files
console.log('loopTroughFileAndFilter');
var promises = [];
    for( let i in list){
        promises.push(readAndFilterAllLineFromXLSX(list[i],jsonfile));
    }

    return Promise.all(promises);
}

function readAllLineFrom(file){
  console.log('readAllLineFrom');
  return new Promise((resolve, reject) => {
    const list = [];
    const rl = readline.createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity
        });

     // printLine(rl);
       filterLine(rl,list);
         rl.on('close', () =>{
        console.log('List '+ list.length);
        resolve()
      });
  });

}

function readAndFilterAllLineFromXLSX(file,jsonfile){
  console.log('readAllLineFromXLSX');
  return new Promise((resolve, reject) => {
       var filteredList = filterFile(file,jsonfile);
       //console.log("filteredList : "+filteredList);
        writeResult(file,filteredList, function(){
             resolve();
        });
       
      });
}




function printLine(stream){
  return new Promise((resolve) => {
      stream.on('line', (line) => {
        console.log(`Line from file: ${line}`);
      });
    })
}

function readOneLine(stream,list){
  return new Promise((resolve) => {
        stream.on('line', (line) => resolve(line));
    })
}

function filterLine(stream,list){
  return new Promise((resolve) => {
        stream.on('line', (line) => {
            //console.log(`Line from file: ${line}`);
            list.push(line);
            resolve();
        });
    })
}



//readFromFile(nameFile);
//readFromFolder(nameFile);

//parseXlSX(nameFile);

/*
let rawdata = fs.readFileSync('filter.json');  
let jsonconf = JSON.parse(rawdata); 
for( var key in jsonconf){
    console.log('key : ' + key + ' value '+jsonconf[key]); 
} 
 */

//filterFile(nameFile,configJSON);

readFromFolderAndFilter(nameFile,configJSON);
