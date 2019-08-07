let limits = {
    [STRUCTURE_EXTENSION]: { 0: 0, 1: 0, 2: 5, 3: 10, 4: 20, 5: 30, 6: 40, 7: 50, 8: 60 },
    [STRUCTURE_CONTAINER]: { 0: 5, 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5},
    [STRUCTURE_TOWER]: { 0: 0, 1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 6},
    [STRUCTURE_STORAGE]: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 },
    [STRUCTURE_ROAD]: { 0: 0, 1: 10, 2: 150, 3: 150, 4: 150, 5: 150, 6: 150, 7: 200, 8: 200 },
    [STRUCTURE_SPAWN]: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 2, 8: 3 },
    [STRUCTURE_RAMPART]: { 0: 0, 1: 00, 2: 0, 3: 10, 4: 20, 5: 50, 6: 100, 7: 200, 8: 200 },
    [STRUCTURE_TERMINAL]: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1 },
    [STRUCTURE_EXTRACTOR]: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1 },
    [STRUCTURE_POWER_SPAWN]: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1 }
};

let canBuildHere = function(room,x,y) {
    if(x < 0 || x > 49 || y < 0 || y > 49) return false;
    let tgt = room.getPositionAt(x,y);
    let buildable = (room.find(FIND_STRUCTURES, {
        filter: (s) => {
            return (s.structureType != STRUCTURE_ROAD && s.pos == tgt);
        }}).length == 0) && 
        (room.find(FIND_CONSTRUCTION_SITES, {
        filter: (s) => {
            return (s.structureType != STRUCTURE_ROAD && s.pos == tgt);
        }}).length == 0);
    return buildable;
};
let attemptCreate = function(r,tgt,stype,count=0) {
    if(r.createConstructionSite(tgt,stype) == OK) {
        count = count+1;
        return true;
    }
    return false;
};

let taskManage = module.exports;
taskManage.run = function(spawns) {
    let spawn1 = spawns[0];
    let r = spawn1.room;
    let rcl = r.controller.level;
    if(Game.time % 100 == 0) {
        console.log(spawn1.room.name + ": scanning to place new structures...");
        this.plan(spawn1, STRUCTURE_ROAD, 'roads', 3);
        this.plan(spawn1, STRUCTURE_CONTAINER, 'containers', 2);

        if(rcl > 1) {
            this.plan(spawn1, STRUCTURE_EXTENSION, 'extensions', 1);
            if(rcl > 2) {
                this.plan(spawn1, STRUCTURE_TOWER, 'towers', 1);
                if(rcl > 3) {
                    this.plan(spawn1, STRUCTURE_STORAGE, 'storage', 6);
                    if(rcl > 5) {
                        this.plan(spawn1, STRUCTURE_TERMINAL, 'terminals', 1);
                        this.plan(spawn1, STRUCTURE_EXTRACTOR, 'extractors', 5);
                        this.plan(spawn1, STRUCTURE_RAMPART, 'ramparts', 4);
                        if(rcl > 6) {
                            this.plan(spawn1, STRUCTURE_SPAWN, 'spawns', 1);
                            if(rcl > 7) {
                                this.plan(spawn1, STRUCTURE_POWER_SPAWN, 'powerspawn', 1);
                            }
                        }
                    }
                }
            }
        }
        // this.remove(spawn1, STRUCTURE_ROAD, 'roads');
    }

    let target = Memory.roomData[r.name].claiming;
    if(target && Game.rooms[target]) {
        if(Game.rooms[target].find(FIND_MY_SPAWNS).length > 0) {
            let pioneers = Game.rooms[target].find(FIND_MY_CREEPS);
            for(let p in pioneers) {
                Game.creeps[pioneers[p].name].memory.home = target;
            }
            delete Memory.roomData[r.name].claiming;
        }
    }
};
taskManage.plan = function(spawn1, stype, eng, ptype) {
    let r = spawn1.room;
    let rcl = r.controller.level;
    let count = r.find(FIND_STRUCTURES, {
        filter: (s) => {
            return (s.structureType === stype);
        }}).length + 
        r.find(FIND_CONSTRUCTION_SITES, {
            filter: (s) => {
                return (s.structureType === stype);
        }}).length;
    let limit = limits[stype][rcl];
    if(count >= limit) return;
    if(stype != STRUCTURE_ROAD && stype != STRUCTURE_RAMPART) {
        // let msg = r.name + ": missing " + eng + ", at " + count + " of " + limit;
        // global.displays.push(msg);
    }
    
    if(ptype == 1) { //construct surrounding the spawn
        let sx = spawn1.pos.x, sy = spawn1.pos.y, m = (sx+sy) % 2;
        let depth = 1;
        let tgt;
        while(count < limit && depth <= 20) {
            x = sx - depth; y = sy + depth;
            for(let i = 0; i <= depth * 2; i++) {
                if((x+y) % 2 == m) {
                    tgt = r.getPositionAt(x,y,r.name);
                    attemptCreate(r,tgt,stype,count);
                }
                if(i != depth * 2) y--;
            }
            for(let i = 1; i <= depth * 2; i++) {
                x++;
                if((x+y) % 2 == m) {
                    tgt = r.getPositionAt(x,y,r.name);
                    attemptCreate(r,tgt,stype,count);
                }
            }
            for(let i = 1; i <= depth * 2; i++) {
                y++;
                if((x+y) % 2 == m) {
                    tgt = r.getPositionAt(x,y,r.name);
                    attemptCreate(r,tgt,stype,count);
                }
            }
            for(let i = 1; i <= depth * 2 - 1; i++) {
                x--;
                if((x+y) % 2 == m) {
                    tgt = r.getPositionAt(x,y,r.name);
                    attemptCreate(r,tgt,stype,count);
                }
            }
            depth++;
        }
    } else if(ptype == 2) { //construct at source
        let sourceData = Memory.roomData[r.name].sourceData;
        for(let id in sourceData) {
            let tgt = JSON.parse(sourceData[id].container);
            attemptCreate(r,r.getPositionAt(tgt.x,tgt.y,r.name),stype);
        }
    } else if(ptype == 3) { //construct on beaten path
        let travelDat = Memory.roomData[r.name].travelData;
        for(key in travelDat) {
            if(travelDat[key] > 34) {
                let tgt = JSON.parse(key);
                attemptCreate(r,r.getPositionAt(tgt.x,tgt.y,r.name),stype);
            }
        };
    } else if(ptype == 4) { //construct on important structures
        let structs = r.find(FIND_STRUCTURES, {
            filter: (s) => {
                let t = s.structureType;
                return (t == STRUCTURE_SPAWN || t == STRUCTURE_STORAGE || t == STRUCTURE_POWER_SPAWN ||
                    // t == STRUCTURE_NUKER || t == STRUCTURE_OBSERVER || t == STRUCTURE_TOWER ||
                    t == STRUCTURE_TERMINAL);// || t == STRUCTURE_LAB);
        }});
        structs.forEach(function(s) {
            tgt = s.pos;
            attemptCreate(r,r.getPositionAt(tgt.x,tgt.y,r.name),stype);
        });
    }
    else if(ptype == 5) { // construct on minerals
        let minerals = r.find(FIND_MINERALS);
        minerals.forEach(function(m) {
            tgt = m.pos;
            attemptCreate(r,r.getPositionAt(tgt.x,tgt.y,r.name),stype);
        });
    } else if(ptype == 6) { //construct up to 5 into route from controller to spawn
        let route = PathFinder.search(spawn1.room.controller,spawn1).path;
        let i = 4;
        while(i >= 0 && !attemptCreate(r,r.getPositionAt(route[i].x,route[i].y,r.name),stype)) {
            i--;
        }
    }
};
taskManage.remove = function(spawn1,stype,eng) {
    let r = spawn1.room;
    let sites = r.find(FIND_CONSTRUCTION_SITES, {
            filter: (s) => {
                let dat = JSON.stringify({x:s.pos.x,y:s.pos.y});
                let t = s.structureType;
                return (t === stype && ((!Memory.roomData[r.name].travelData[dat]) || 
                        (Memory.roomData[r.name].travelData[dat] && Memory.roomData[r.name].travelData[dat] < 10)));
            }
    });
    for(let i = 0; i < sites.length; i++) {
        sites[i].remove();
    }
};
taskManage.name = "planning";