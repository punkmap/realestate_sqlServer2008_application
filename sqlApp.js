var express = require('express');
var app = express();
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

const serverConfig = require('./config')
console.log("serverConfig: ")
console.log(serverConfig)
var config = {
    server: serverConfig.server,
    userName: serverConfig.userName,
    password: serverConfig.password,
    options: {
        database: serverConfig.database
        , rowCollectionOnRequestCompletion: true
    }
    // server: "10.4.101.92",
    // userName: "gis",
    // password: "cary_ESRI",
    // options: {
    //     database:"REAL_ESTATE_TEST"
    //     , rowCollectionOnRequestCompletion: true
    // }
}

var connection = new Connection(config);

connection.on('connect', function(err) {
  // If no error, then good to go...
    if (!err){
        console.log("you're connected to the real estate database");
        //executeStatement()
    }
    else{
        console.log("you ain't connected to the real estate database: " + JSON.stringify(err));
    }
  }
);

app.use(function (req, res, next) {
    //CORS settings to anywhere
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    //res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    console.log('res.getHeaders(): ' + JSON.stringify(res.getHeaders()));
    
    // Pass to next layer of middleware
    next();
});

function canAddBaseData(canAddBaseQuery, callback){
    console.log('!!!!!canAddBaseData!!!!!')
    console.log('query: ' + canAddBaseQuery)
    const selectRequest = new Request(canAddBaseQuery, function(err, rowCount, rows) {
        let returnVal
        if (err) {
            returnVal = {'status':'error', 'info':'there was an error checkign to see if records can be added to RE_BASE_DATA','error':err,'mood':{'canAddBaseData':'(ﾉ▀̿̿Ĺ̯̿̿▀̿ ̿ )ﾉ ︵┻━┻"'}}
        } else {
            let canAdd
            rowCount > 0 ? canAdd = false : canAdd = true
            returnVal = {'status':'error', 'info':'canAddBaseData is complete','data':canAdd,'mood':{'canAddBaseData':'(ﾉ▀̿̿Ĺ̯̿̿▀̿ ̿ )ﾉ ︵┻━┻"'}}
        }
        callback(returnVal);
    });
    connection.execSql(selectRequest);
}
function addBaseData(insertBaseQuery, callback){
    console.log('!!!!!addBaseData!!!!!')
    console.log('query: ' + insertBaseQuery);
    const request = new Request(insertBaseQuery, function(err, rowCount, rows) {
        let returnVal
        if (err) {
            returnVal = {'status':'error', 'info':'there was an error adding record to RE_BASE_DATA','error':err,'mood':{'addBaseData':'(ﾉ▀̿̿Ĺ̯̿̿▀̿ ̿ )ﾉ ︵┻━┻"'}}
        } else {
            console.log(rowCount + ' rows added to RE_BASE_DATA');
            returnVal = {'status':'success', 'info':rowCount + ' rows added to RE_BASE_DATA','mood':{'addBaseData':'(｡◕‿‿◕｡)'}}
        }
        callback(returnVal)
    });
    connection.execSql(request);
}
function deleteBaseData(deleteBaseQuery, callback){
    console.log('!!!!!deleteBaseQuery!!!!!')
    console.log('query: ' + deleteBaseQuery);
    const request = new Request(deleteBaseQuery, function(err, rowCount, rows) {
        let returnVal
        if (err) {
            returnVal = {'status':'error', 'info':'there was an error deleting record to RE_BASE_DATA','error':err,'mood':{'addBaseData':'(ﾉ▀̿̿Ĺ̯̿̿▀̿ ̿ )ﾉ ︵┻━┻"'}}
        } else {
            console.log(rowCount + ' rows deleted from RE_BASE_DATA');
            returnVal = {'status':'success', 'info':rowCount + ' rows deleted to RE_BASE_DATA','data':{'rowCount':rowCount},'mood':{'addBaseData':'(づ｡◕‿‿◕｡)づ'}}
        }
        callback(returnVal)
    });
    connection.execSql(request);
}
function addPropData(missingRealids, parceldata,callback){
    let insertPropDataQuery = 'INSERT INTO RE_PROP_DATA ("Realid","Location","StreetNumber","StreetPrefix","StreetName","StreetType") VALUES'
    let i=1
    missingRealids.forEach(function(id){
        console.log('realIds for each id: ' + id);
        parceldata.forEach(function(p){
            if(p.Realid === id){
                insertPropDataQuery += " ('"+p.Realid+"','"+p.Location+"','"+p.StreetNumber+"','"+p.StreetPrefix+"','test','"+p.StreetType+"')"
                if(i<missingRealids.length){
                    insertPropDataQuery+=','
                }
            }
        })
        i++
    })
    insertPropDataQuery+=';'     
    console.log('!!!!!addPropData!!!!!')
    console.log('query: ' + insertPropDataQuery);
    const request = new Request(insertPropDataQuery, function(err, rowCount, rows) {
        let returnVal
        if (err) {
            returnVal = {'status':'error', 'info':'there was an error adding record to RE_PROP_DATA','error':err,'mood':{'addPropData':'(ﾉ▀̿̿Ĺ̯̿̿▀̿ ̿ )ﾉ ︵┻━┻"'}}
        } else {
            returnVal = {'status':'success', 'info':rowCount + ' rows added to RE_PROP_DATA','mood':{'addPropData':'(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧'}} 
        }
        callback(returnVal)
    });
    connection.execSql(request); 
}
function selectMissingPropData(selectMissingPropQuery, callback){
    console.log('!!!!!selectMissingPropData!!!!!')
    console.log('query: ' + selectMissingPropQuery);
    const missingRealIdReq = new Request(selectMissingPropQuery, function(err, rowCount, rows) {
        let returnVal
        if (err) {
            returnVal = {'status':'error', 'info':'there was an error finding missing RE_PROP_DATA','error':err,'mood':{'selectMissingPropData':'(ﾉ▀̿̿Ĺ̯̿̿▀̿ ̿ )ﾉ ︵┻━┻"'}}
        } else {
            returnVal = {'status':'success', 'info':rowCount + ' rows missing from RE_BASE_DATA', 'data':{'rowCount':rowCount,'rows':rows}, 'mood':{'selectMissingPropData':'༼ʘ̚ل͜ʘ̚༽'}} 
        }
        callback(returnVal)
    });
    connection.execSql(missingRealIdReq);
}
function selectPropData(selectPropQuery, callback){
    console.log('!!!!!selectPropData!!!!!')
    console.log('query: ' + selectPropQuery)
    const realIdReq = new Request(selectPropQuery, function(err, rowCount, rows) {
        let returnVal
        if (err) {
            returnVal = {'status':'error', 'info':'there was an error finding RE_PROP_DATA','error':err,'mood':{'selectMissingPropData':'(ﾉ▀̿̿Ĺ̯̿̿▀̿ ̿ )ﾉ ︵┻━┻"'}}
        } else {
            returnVal = {'status':'success', 'info':rowCount + ' rows exist in RE_BASE_DATA', 'data':{'rowCount':rowCount,'rows':rows}, 'mood':{'selectMissingPropData':'༼ʘ̚ل͜ʘ̚༽'}} 
        }
        callback(returnVal)
    });
    connection.execSql(realIdReq);
}
app.post('/addparcels/:parceldata', function (req, res) {
    const parceldata = JSON.parse(req.params.parceldata)
    let selectBaseDataQuery = 'SELECT * FROM RE_BASE_DATA WHERE' 
    let selectMissingPropDataQuery = 'SELECT Realid FROM (values '
    let insertBaseDataQuery = 'INSERT INTO RE_BASE_DATA ("PROJECTNUM","PHASE","REALID","PinNumber","OwnerWholeName","OwnerAdd1","OwnerAdd2","OwnerAdd3","DeedBook","DeedPage") VALUES'
    let i=1;
    //set up initial queries
    let project, phase
    parceldata.forEach(function(p){
        project = p.Project
        phase=p.Phase
        insertBaseDataQuery+=" ('"+p.Project+"','"+p.Phase+"','"+p.Realid+"','"+p.PIN10+"','"+p.OwnerWholeName+"','"+p.OwnerAdd1+"','"+p.OwnerAdd2+"','test','"+p.DeedBook+"','"+p.DeedPage+"')"
        if(i<parceldata.length){
            selectBaseDataQuery += " REALID ='"+p.Realid+"' AND PROJECTNUM = '"+p.Project+"' AND PHASE = '"+p.Phase+"' OR"
            insertBaseDataQuery+=','
            selectMissingPropDataQuery += "('"+p.Realid+"'),"
        }
        else{
            selectBaseDataQuery += " REALID ='"+p.Realid+"' AND PROJECTNUM = '"+p.Project+"' AND PHASE = '"+p.Phase+"'"
            selectMissingPropDataQuery += "('"+p.Realid+"'))"
        }
        i++
    })
    insertBaseDataQuery+=';'
    selectMissingPropDataQuery+=' as T(Realid) EXCEPT SELECT Realid FROM RE_PROP_DATA;'
    let moods = []
    //see if any records are missing from prop data
    selectMissingPropData(selectMissingPropDataQuery, function(missingPropsResult){
        if(missingPropsResult.status === "success"){
            moods.unshift(missingPropsResult.mood)
            //if missing records:
            if(missingPropsResult.data.rowCount!==0){
               let missingRealids = []
               missingPropsResult.data.rows.forEach(function(row) {
                    missingRealids.unshift(row[0].value);
                });

                addPropData(missingRealids, parceldata, function(insertPropResult){
                    moods.unshift(insertPropResult.mood)
                    if(insertPropResult.status==='success'){
                        canAddBaseData(selectBaseDataQuery, function(noDupes){
                            if(noDupes.data){
                                addBaseData(insertBaseDataQuery, function(insertBaseResult){
                                    if(insertBaseResult.status === 'success'){
                                        moods.unshift(insertBaseResult.mood)
                                        res.send({'status':'success', 'moods':moods});        
                                    }            
                                    else {
                                        //!!!!!TODO - send error res here
                                    }
                        
                                })
                            }
                            else {
                                moods.unshift(noDupes.mood)
                                res.send({'status':'warning','message':"The selection you have made already has a record for Project: '" + project + "' & Phase: '" + phase +"'. Please check your selection and the project and phase.", 'moods': moods})
                            }
                        })
                    }
                    else {
                        //!!!!!TODO - send error res here
                    }
                })  
            } 
            //if no missing records then just add the base data:
            else {
                //check for duplicates 
                canAddBaseData(selectBaseDataQuery, function(noDupes){
                    if(noDupes.data){
                        //if no duplicates then add the data. 
                        addBaseData(insertBaseDataQuery, function(insertBaseResult){
                            if(insertBaseResult.status === 'success'){
                                moods.unshift(insertBaseResult.mood)
                                res.send({'status':'success', 'moods':moods});        
                            }
                            else {
                                //!!!!!TODO - send error res here
                            }
                        })
                    }
                    else {
                         //let the user know that there are duplicates
                         moods.unshift(noDupes.mood)
                         res.send({'status':'warning','message':"The selection you have made already has a record for Project: '" + project + "' & Phase: '" + phase +"'. Please check your selection and the project and phase.", 'moods': moods})
                    }
                })
            }
        }
        else {
            //!!!!!TODO - send error res here
        }

    })
});
app.post('/deleteparcels/:parceldata', function (req, res) {
    const parceldata = JSON.parse(req.params.parceldata)
    let deleteBaseDataQuery = 'DELETE FROM RE_BASE_DATA WHERE'
    let checkBaseDataQuery = 'SELECT * FROM RE_BASE_DATA WHERE Realid IN ('
    let i=1;
    //set up initial queries
    let totalRealids = []
    let project, phase
    parceldata.forEach(function(p){
        project = p.Project
        phase=p.Phase
        totalRealids.unshift(p.Realid)
        deleteBaseDataQuery+=" PROJECTNUM = '"+p.Project+"' AND PHASE = '"+p.Phase+"' AND REALID ='"+p.Realid+"'"
        checkBaseDataQuery += "'"+p.Realid+"'"
        if(i<parceldata.length){
            deleteBaseDataQuery += " OR"
            checkBaseDataQuery += ","
        }
        i++
    })
    deleteBaseDataQuery+=';'
    checkBaseDataQuery+=');'
    let moods = []
    //see if any records are missing from prop data
    deleteBaseData(deleteBaseDataQuery, function(deleteBaseResult){
        if(deleteBaseResult.status === 'success'){
            moods.unshift(deleteBaseResult.mood)
            if (deleteBaseResult.data.rowCount !== 0){
                selectPropData(checkBaseDataQuery, function(checkBaseDataResult){
                    if(checkBaseDataResult.data.rowCount){
                        checkBaseDataResult.data.rows.forEach(function(row){
                            //console.log(row[0].value)
                            if (totalRealids.indexOf(row[0].value)>-1)
                            totalRealids.splice(totalRealids.indexOf(row[0].value),1)
                        })
                        res.send({'status':'success', 'data':totalRealids, 'moods': moods})
                    }
                    else {
                        res.send({'status':'success', 'data':totalRealids, 'moods': moods})
                    }
                })
            }
            else {
                res.send({'status':'warning','message':"The selection you have made has no record for Project: '" + project + "' & Phase: '" + phase +"'. Please check your selection and the project and phase.", 'moods': moods})
            }    

        }
        else {
            //!!!!!TODO - send error res here
        }
    })
});
app.post('/getprojectparcels', function (req, res) {
    var request = new Request("SELECT DISTINCT PinNumber FROM RE_BASE_DATA", function(err, rowCount, rows) {
        if (err) {
          console.log(err);
        } else {
          console.log(rowCount + ' rows');
          let pins = []
          rows.forEach(function(row){
              pins.push(row[0].value)
          })
          res.send(pins)
        }
      });
    connection.execSql(request);
});
app.post('/getprojectattributes/:pin10', function (req, res) {
    
    const pin10 = JSON.parse(req.params.pin10)
    const query = "SELECT REALID, PROJECTNUM,PHASE,PROJECT_NA,PROJECTTYP,REALESTATE,ENGINEER,DATEINITIA,"+
                  "DATEOFFERM,DATEOFFERA,APPRAISER,TOTALCOMPE,RESOLUTION,TYPENOTARY,AMT_7100,AMT_7102,"+
                  "DATECOMPTO,RECDEEDTOT,OFFERAMOUN,NOTES,DEDICATED,OwnerWholeName,OwnerAdd1,OwnerAdd2,"+
                  "OwnerAdd3,DeedBook,PinNumber FROM RE_BASE_DATA WHERE PinNumber = '" +pin10+ "'";
    var request = new Request(query, function(err, rowCount, rows) {
    if (err) {
        console.log(err);
    } else {
        //console.log('projs: ' + JSON.stringify(projs))
        console.log('projs.length: ' + projs.length)
        rows.forEach(function(row){
            // if(i < 1){console.log(JSON.stringify(row[0].metadata.colName))}
            // i++
            //console.log(JSON.stringify(row[0]))
            //const colName = row[0].metadata.colName
            //proj.push({ colName : row[0].value})
        })
        
        res.send(projs)
    }
    });
    let projs = []
    let proj = {}
    let i = 0
    request.on('row', function(rows) {
        console.log('row: ' + i)
        i++
        rows.forEach(function(row) {
            proj[row.metadata.colName] = row.value
        });
        console.log('proj: ' + JSON.stringify(proj));
        projs.push(JSON.parse(JSON.stringify(proj)));
    });
    connection.execSql(request);
});
app.get('/test', function(req, res) {
    res.send('sqlApp.js ﴾͡๏̯͡๏﴿ O`RLY? [̲̅$̲̅(̲̅5̲̅)̲̅$̲̅] ლ(ಠ益ಠლ)');
});
app.get('/sqlapp', function (req, res) {
    res.send('sqlApp.js [̲̅$̲̅(̲̅5̲̅)̲̅$̲̅]');
});
app.listen(4001, 'localhost',  function () {
  console.log('Example app listening on port 3001!');
});

