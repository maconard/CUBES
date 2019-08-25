let upgrader = require('role.upgrader');
let priority = {
    [STRUCTURE_SPAWN]: 20,
    [STRUCTURE_CONTROLLER]: 19,
    [STRUCTURE_EXTENSION]: 18,
    [STRUCTURE_STORAGE]: 17,
    [STRUCTURE_CONTAINER]: 16,
    [STRUCTURE_TOWER]: 15,
    [STRUCTURE_ROAD]: 14,
    [STRUCTURE_RAMPART]: 13,
    [STRUCTURE_EXTRACTOR]: 12,
    [STRUCTURE_LAB]: 11,
    [STRUCTURE_WALL]: 10
}

let repairman = module.exports;
repairman.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
    if(creep.memory.working && creep.carry.energy == 0) {
        creep.memory.working = false;
    }
    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }

    if(creep.memory.working) {
        // creep.say('repairing');
        let targets = _.toArray(creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                let dat = JSON.stringify({x:s.pos.x,y:s.pos.y});
                let t = s.structureType;
                return (
                        ((t == STRUCTURE_WALL || t == STRUCTURE_RAMPART) && s.hits < 50000) ||
                        ((t != STRUCTURE_ROAD && t != STRUCTURE_WALL && 
                            t != STRUCTURE_RAMPART) && s.hits < s.hitsMax) ||
                        (t == STRUCTURE_ROAD && s.hits < s.hitsMax &&
                        (Memory.roomData[creep.room.name].travelData[dat] > 15)));
            }
        })).sort((a,b) => priority[b.structureType] - priority[a.structureType]);
        if(targets.length > 0) {
            // console.log(targets[0].structureType);
            if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        } else {
            upgrader.run(creep);
        }
    }
    else {
        // creep.say('collecting');
        let store = spawn1.room.storage;
        let target = false;
        if(store && store.store.energy >= 50) {
            target = store;
        }
        if(!store) {
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= 50)});
        }
        if(target) {
            if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            if(global.util.pickupEnergyInRange(creep,20)) return;
            
            if(creep.carry.energy > 0)
                creep.memory.working = true;
            else
                creep.moveTo(spawn1.room.controller);
        }
    }
};
repairman.base = [WORK,CARRY,MOVE,MOVE];
repairman.add = {
    0: { type: WORK, amt: 19 },
    1: { type: CARRY, amt: 14 },
    2: { type: MOVE, amt: 13 }
};