let upgrader = require('role.upgrader');
let config = require('config');

let builder =  {
    run: function(creep) {
        let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            // creep.say('building');
            if(config.buildTarget != "" && spawn1.room.controller.level > 6) {
                let targetRoom = config.buildTarget;
                if(!(creep.room.name == targetRoom)) {
                    creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetRoom)));
                    return;
                }
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
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                upgrader.run(creep);
            }
        }
        else { //harvesting or collecting energy\
            // creep.say('collecting');
            let t = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 7, {
                    filter: (r) => r.resourceType == RESOURCE_ENERGY});
            if(t.length > 25) {
                creep.pickup(t[0])
                creep.moveTo(t[0]);
                return;
            }

            if(config.buildTarget != "" && creep.room.name == config.buildTarget) {
                let source = creep.pos.findClosestByPath(FIND_SOURCES, {
                    filter: (s) => {
                        return s.room.name == config.buildTarget;
                    }
                });
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    if(creep.moveTo(source,{visualizePathStyle: {stroke: '#ffaa00'}}) == ERR_NO_PATH) {
                    }
                }
                return;
            }

            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_CONTAINER || 
                            structure.structureType == STRUCTURE_STORAGE) && 
                            structure.store[RESOURCE_ENERGY] > 50);
                }
            });
            if(target) {
                let x = creep.withdraw(target, RESOURCE_ENERGY);
                if(x == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                }       
            } else {
                creep.moveTo(spawn1.room.controller);
            }
        }
    },
    base: [WORK,CARRY,MOVE],
    add: {
        0: { type: WORK, amt: 12 },
        1: { type: CARRY, amt: 12 },
        2: { type: MOVE, amt: 23 }
        // 3: { type: TOUGH, amt: 5 },
        // 4: { type: TOUGH, amt: 5 }
    }
};

module.exports = builder;