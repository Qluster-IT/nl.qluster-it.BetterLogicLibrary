
const { BL } = require("betterlogiclibrary");

/// Define defaults
const _now = Date.now();
let _last = _now;
const time = (str)=> {
  console.log(str.padEnd(50, " ") + ' - Duration: ' + (Date.now()-_last)+ ', Total: ' + (Date.now()-_now));
  _last = Date.now();
 };
 


module.exports = FindObjectsInFlows;

/// -- The Find Objects in Flows Script --
/// Search for objects in flows and advanced flows.
/// Created by Arie J. Godschalk
/// Creation date: 2022-10-05
/// Script to find objects (Variables, Devices, Zones, Apps)  within Flows and AFs.

//return await FindObject('variables');
//return await FindObject('devices');
//return await FindObject('zones');
//return await FindObject('apps');

//return await FindObject('variables', 'test');
//return await FindObject('variables', 'c31ecacc-26fe-448e-ab00-d109618c8382');
//return await FindObject('devices', [{id:'f6ef2b6f-e3f2-4ecf-a205-4f919a7a6d3f'}, {name:'Test AVD'}, {name:'Light SwitCH'} ]);
//return await FindObject('zones', 'Hal*'); //Use astrix at the end means it tries to find the start of the name
//return await FindObject('apps', 'Device Cap*');

async function FindObjectsInFlows(type, toFind, Homey) {
  const _ = BL._;
  let preType;
  let objectsToFind;
  if(toFind) {
    if(!_.isArray(toFind)) toFind = [toFind];
    for(let i=0;i<toFind.length;i++) {
      if(typeof(toFind[i])=='string') {
        if(type!=='apps' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/gm.test(toFind[i])) toFind[i] = {id:toFind[i]};
        else  toFind[i] = {name:toFind[i]};
      }
      if(toFind[i].name && toFind[i].name.endsWith('*')) {
        toFind[i].startsWith = true;
        toFind[i].name = toFind[i].name.substring(0,toFind[i].name.length-1);
      }
    }
  }
  console.log(toFind);
  //return toFind;
  
  time('ObjectToFind Collect - Start');
  switch(type.toLowerCase()) {
    case 'variables':
      preType = 'homey:manager:logic|';
      objectsToFind = await Homey.logic.getVariables();
      break;
    case 'devices':
      preType = 'homey:device:';
      objectsToFind = await Homey.devices.getDevices();
      break;
    case 'zones':
      preType = 'homey:zone:';
      objectsToFind = await Homey.zones.getZones();
      break;
    case 'apps':
      preType = 'homey:app:';
      objectsToFind = await Homey.apps.getApps();
      break;
  }
  time('ObjectToFind Collect - Finish');

  time('ObjectToFind Filter - Start');

if(toFind) objectsToFind = _.pickBy(objectsToFind, o=> !!_.find(toFind, find=>
    (!find.id || o.id===find.id) && 
    (!find.name || (find.startsWith ? o.name.toLowerCase().startsWith(find.name.toLowerCase()) : o.name.toLowerCase()===find.name.toLowerCase()))));
  time('ObjectToFind Filter - Finish');
  //let type = 'Variables'
  
  
  time('Get Flows - Start');
  let flows = await Homey.flow.getFlows();
  time('Get Flows - Finish');

  //flows = _.filter(flows, f=>f.name==='FIND VARIABLES');
  time('Get Advanced Flows - Start');
  let afs = await Homey.flow.getAdvancedFlows();
  time('Get Advanced Flows - Finish');

  let cardTypes = ['trigger', 'condition', 'action'];


  let objectsFound = {};

  let containsId = (str, id, preFixed)=> typeof(str)==='string' ? (str.indexOf(preFixed? (preFixed===2?'[[':'')+preType+id : id)>-1) : null;
  let containsIds = (str, preFixed)=> containsId(str, objectsToFind, preFixed);

  let addToFound = (flow, cardType, obj) => {
    if(!objectsFound[obj.id]) objectsFound[obj.id] = {id:obj.id, name:obj.name, flows:{}}
    if(!objectsFound[obj.id].flows[flow.id]) objectsFound[obj.id].flows[flow.id] = {id:flow.id, name:flow.name, enabled:flow.enabled};
    if(!objectsFound[obj.id].flows[flow.id][cardType+'s']) {
      objectsFound[obj.id].flows[flow.id][cardType+'s'] = true;//{found:true};
    }
  };

  time('Remap Flows - Start');
  flows = _.map(flows,f=>{let rFlow = {
    id:f.id,
    name:f.name
    };
    for(let i=0;i<cardTypes.length;i++) {
      let cardType = cardTypes[i];
      if(f[cardType+'s']) rFlow[cardType+'s'] = _.map(f[cardType+'s'], x=>{
        var r= {
          ownerUri:x.uri,
          args:_.filter(x.args, arg=> arg && 
        (
          (typeof(arg)==='string' && arg.indexOf('[['+preType)>-1) ||
          (typeof(arg)==='object')
        )
        )};
        if(!Object.keys(r.args).length) delete r.args;
        if(x.droptoken && x.droptoken.indexOf(preType)>-1) r.droptoken = x.droptoken;
        return r;
      });
    }
    return rFlow;
  });
  time('Remap Flows - Finish');


  time('Remap Advanced Flows - Start');
  afs = _.map(afs,f=>{let rFlow = {
    id:f.id,
    name:f.name
    };
    for(let i=0;i<cardTypes.length;i++) {
      let cardType = cardTypes[i];
      //if(f[cardType+'s']) 
      rFlow[cardType+'s'] = _.map(_.filter(f.cards, c=>c.type===cardType), x=>{
        var r= {
          ownerUri:x.ownerUri,
          args:_.filter(x.args, arg=> arg && 
        (
          (typeof(arg)==='string' && arg.indexOf('[['+preType)>-1) ||
          (typeof(arg)==='object')
        )
        )};
        if(!Object.keys(r.args).length) delete r.args;
        if(x.droptoken && x.droptoken.indexOf(preType)>-1) r.droptoken = x.droptoken;
        return r;
      });
    }
    return rFlow;
  });

  time('Remap Advanced Flows - Finish');

  time('Combining Flows and Advanced Flows - Start');
  flows = _.union(flows, afs);
  time('Combining Flows and Advanced Flows - Finish');




  time('Search Objects - Start');
  for(let objID in objectsToFind) {
    let obj = objectsToFind[objID];
    for (let iFlow=0;iFlow<flows.length;iFlow++) {
      let flow = flows[iFlow];
      for(let iCardType=0;iCardType<cardTypes.length;iCardType++) {
          let cardType = cardTypes[iCardType];
          if(flow[cardType+'s']) 
            for(let iCards=0;iCards<flow[cardType+'s'].length;iCards++) {
              let card = flow[cardType+'s'][iCards];
              if(containsId(card.droptoken, obj.id, 1)) addToFound(flow, cardType, obj);
              if(containsId(card.ownerUri, obj.id, 1)) addToFound(flow, cardType, obj);

              if(card.args) _.each(card.args, arg=> {
                switch (typeof(arg)) {
                  case 'string':
                  if(containsId(arg, obj.id, 2)) addToFound(flow, cardType, obj);
                    break;
                  case 'object':
                    for(let o in arg) {
                      if(containsId(arg[o], obj.id)) addToFound(flow, cardType, obj);
                    }               
                    break;
                }
              });
            }
          
      }
    }
  }
  time('Search Objects - Finish');

  return objectsFound;
};