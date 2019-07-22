let miner = module.exports;
miner.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];

    let sum = _.sum(creep.carry);

    if(!creep.memory.working && sum == creep.carryCapacity) {
        creep.memory.working = true;
    }
    if(creep.memory.working && sum == 0) {
        creep.memory.working = false;
    }

    if(!creep.memory.working) {
        // creep.say("mining");
        let t = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 30, {
                filter: (r) => r.resourceType != RESOURCE_ENERGY});
        if(t.length > 0) {
            creep.pickup(t[0])
            creep.moveTo(t[0]);
            return;
        }
        let source = creep.pos.findClosestByPath(FIND_MINERALS);
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            if(creep.moveTo(source) == ERR_NO_PATH) {
            }
        }
    } else { //depositing minerals
        // creep.say("depositing");
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_TERMINAL
                                && _.sum(s.store) < 290000) });
        if(target) {
            Object.keys(creep.carry).forEach(function(r) {
                let amt = 290000 - _.sum(target.store);
                let hold = _.sum(creep.carry);
                if(amt > hold) amt = hold;
                if(creep.transfer(target, r, amt) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            });
        }
    }
};
miner.base = [WORK,CARRY,MOVE];
miner.add = {
    0: { type: WORK, amt: 5},
    1: { type: WORK, amt: 5},
    2: { type: CARRY, amt: 3},
    3: { type: MOVE, amt: 4}
};