let rangeharvester =  {
    run: function(creep) {
        let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
        let energy = creep.pos.findInRange(FIND_DROPPED_RESOURCES,1);
        if (energy.length) {
            creep.pickup(energy[0]);
        }
            
        if(typeof(creep.memory.job) == 'undefined') {
            creep.memory.job = 'HARVESTING';
        }
            
        if(creep.memory.job === 'HARVESTING') {
            if(typeof(creep.memory.opt) == 'undefined') {
                creep.memory.opt = 1;
            }
            let flag = 'farSource' + creep.memory.opt;
            creep.moveTo(Game.flags[flag]);
            let source = creep.pos.findClosestByPath(FIND_SOURCES);
            if(source) {
                creep.harvest(source);
            }
            if(creep.carry.energy == creep.carryCapacity) {
                creep.memory.job = 'TRANSFERING';
            }
        } else {
            if(creep.room !== Game.rooms['E99N62']) {
                if(creep.room.controller.ticksToDowngrade < 10000)
                    creep.upgradeController(creep.room.controller);
                creep.moveTo(Game.rooms['E99N62'].controller);
            } else {
                let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < s.storeCapacity)});
                if(target) {
                    let result = creep.transfer(target, RESOURCE_ENERGY);
                    if(result == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    } else if(result == OK) {
                        if(typeof(Memory.rangeHarvesters) == 'undefined') {
                            Memory.rangeHarvesters = {};
                        }
                        let name = creep.name;
                        if(typeof(Memory.rangeHarvesters[name]) == 'undefined') {
                            Memory.rangeHarvesters[name] = creep.carryCapacity;
                        } else {
                            Memory.rangeHarvesters[name] += creep.carryCapacity;
                        }
                    }
                } else {
                    let result = creep.transfer(spawn1, RESOURCE_ENERGY);
                    if(result == ERR_NOT_IN_RANGE) {
                        creep.moveTo(spawn1, {visualizePathStyle: {stroke: '#ff0000 '}});
                    } else if(result == OK) {
                        if(typeof(Memory.rangeHarvesters) == 'undefined') {
                            Memory.rangeHarvesters = {};
                        }
                        let name = creep.name;
                        if(typeof(Memory.rangeHarvesters[name]) == 'undefined') {
                            Memory.rangeHarvesters[name] = creep.carryCapacity;
                        } else {
                            Memory.rangeHarvesters[name] += creep.carryCapacity;
                        }
                    }
                }
                if(creep.carry.energy == 0) {
                    creep.memory.job = 'HARVESTING';
                }
            }   
        }
    },
    base: [WORK,CARRY,MOVE],
    add: {
        0: { type: WORK, amt: 5},
        1: { type: CARRY, amt: 5},
        1: { type: MOVE, amt: 11},
    }
}

module.exports = rangeharvester;