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
        // let t = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 30, {
        //         filter: (r) => r.resourceType != RESOURCE_ENERGY});
        // if(t.length > 0) {
        //     creep.pickup(t[0])
        //     creep.moveTo(t[0]);
        //     return;
        // }
        let source = creep.pos.findClosestByPath(FIND_MINERALS);
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            if(creep.moveTo(source) == ERR_NO_PATH) {
            }
        }
    } else { //depositing minerals
        // creep.say("depositing");
        let term = spawn1.room.terminal;
        if(!Memory.roomData[spawn1.room.name].mineral) {
            let min = spawn1.room.find(FIND_MINERALS);
            Memory.roomData[spawn1.room.name].mineral = min[0].mineralType;
        }
        let rss = Memory.roomData[spawn1.room.name].mineral;
        if(!term.store[rss]) rss = 0;
        
        if(term && (term.storeCapacity - term.store[RESOURCE_ENERGY] - term.store[rss] <= 20000))
            term = false;
        if(term) {
            let hold = _.sum(creep.carry);
            let amt = 280000 - _.sum(term.store);
            if(amt > hold) amt = hold;
            for(let r in creep.carry) {
                let result = creep.transfer(term, r, amt);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(term);
                } else if(result == OK) {
                    break;
                }
            }
        }
    }
};
miner.base = [WORK,CARRY,MOVE];
miner.add = {
    0: { type: WORK, amt: 11},
    1: { type: WORK, amt: 11},
    2: { type: CARRY, amt: 3},
    3: { type: MOVE, amt: 5}
};