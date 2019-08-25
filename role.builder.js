let repairman = require('role.repairman');
let config = require('config');

let builder = module.exports;
builder.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
    if(creep.memory.working && creep.carry.energy == 0) {
        creep.memory.working = false;
    }
    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }

    let goClaim = false;
    let targetR;
    if(Memory.roomData[spawn1.room.name].claiming) {
        targetR = Memory.roomData[spawn1.room.name].claiming;
        if(Game.rooms[targetR]) {
            let spawns = Game.rooms[targetR].find(FIND_CONSTRUCTION_SITES, {
                filter: (c) => (c.structureType == STRUCTURE_SPAWN)
            });
            if(spawns.length > 0) {
                goClaim = true;
            }
        }
    }

    if(creep.memory.working) {
        // creep.say('building');
        if(goClaim && creep.memory.role == 'builder' && !(creep.room.name == targetR)) {
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetR)));
            return;
        }
        
        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || 
                structure.structureType == STRUCTURE_RAMPART ||
                structure.structureType == STRUCTURE_SPAWN);
            }
        });
        if(!target) {
            target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        }
        if(target) {
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            repairman.run(creep);
        }
    }
    else { //harvesting or collecting energy\
        // creep.say('collecting');
        if(goClaim && creep.memory.role == 'builder') {
            if(!(creep.room.name == targetR)) {
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetR)));
                return;
            }
            let source = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (s) => {
                    return s.room.name == targetR;
                }
            });
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(source) == ERR_NO_PATH) {
                }
            }
            return;
        }

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
builder.base = [WORK,CARRY,MOVE];
builder.add = {
    0: { type: WORK, amt: 19 },
    1: { type: CARRY, amt: 14 },
    2: { type: MOVE, amt: 14 }
    // 3: { type: TOUGH, amt: 5 },
    // 4: { type: TOUGH, amt: 5 }
};