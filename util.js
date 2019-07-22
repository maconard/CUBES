let priority = {
    [TOUGH]: 10,
    [CARRY]: 9,
    [WORK]: 8,
    [MOVE]: 7,
    [ATTACK]: 6,
    [RANGED_ATTACK]: 5,
    [HEAL]: 4,
    [CLAIM]: 3
};
let cost = {
    [TOUGH]: 10,
    [CARRY]: 50,
    [WORK]: 100,
    [MOVE]: 50,
    [ATTACK]: 80,
    [RANGED_ATTACK]: 150,
    [HEAL]: 250,
    [CLAIM]: 600
}
function bodyCost (body) {
    return body.reduce(function(cost, part) {
        return cost + BODYPART_COST[part];
    }, 0);
};

let util = module.exports;
util.goClaim = function(home,target) {
    return Game.rooms[home].find(FIND_MY_SPAWNS)[0].spawnCreep(
        [TOUGH,CLAIM,WORK,WORK,MOVE,MOVE,MOVE],
        "claimer-"+home,
        { memory: { home: home, role: "claimer", targetRoom: target } }
    );
};
util.pickupEnergyInRange = function(creep,range) {
    let t = creep.pos.findInRange(FIND_DROPPED_RESOURCES, range, {
        filter: (r) => r.resourceType == RESOURCE_ENERGY});
    if(t.length > 0 && t[0].amount > 25) {
        creep.pickup(t[0])
        creep.moveTo(t[0]);
        return true;
    }
    return false;
};
util.getDate = function() {
    let offset = -5;
    return new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace('GMT', 'CST' ); 
};
util.fixTerminals = function(spawn1,creep) {
    let term = spawn1.room.terminal;
    if(term && (_.sum(term.store) > 280000)) {
        for(let rss in term.store) {
            if(rss == RESOURCE_ENERGY) continue;
            let take =  _.sum(term.store) - 280000;
            if(take > creep.carryCapacity) take = creep.carryCapacity;
            if(creep.withdraw(term, rss, take) != OK) {
                creep.moveTo(term);
            } 
            creep.drop(rss);
        }
        return true;
    }
    return false;
}
util.getSum = function(arr,attr="amt") {
    let sum = 0;
    for(let b in arr) {
        sum += arr[b][attr];
    }
    return sum; 
};
util.bodyCost = function(body) {
    return body.reduce(function(cost, part) {
        return cost + BODYPART_COST[part];
    }, 0);
};