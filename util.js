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
function getSum(arr,attr="amt") {
    let sum = 0;
    Object.keys(arr).forEach(function(b) {
        sum += arr[b][attr];
    });   
    return sum; 
};

let util = module.exports;
util.dynamicallyBuildBody = function(roles,role,energy) {
    let body = JSON.parse(JSON.stringify(roles[role].job.base)),
        a = roles[role].job.add,
        nrg = bodyCost(body),
        used = {[TOUGH]:0,[WORK]:0,[CARRY]:0,[MOVE]:0,[HEAL]:0,[CLAIM]:0,[ATTACK]:0,[RANGED_ATTACK]:0},
        i = 0,
        len = _.toArray(a).length;
    
    let sum = getSum(a);
    while((nrg <= energy) && (i < sum)) {
        let at = i % len;
        let x = a[at].type;
        if(used[x] >= a[at].amt) { i++; continue; }
        if(nrg + cost[x] > energy) break;
        body.push(x);
        nrg += cost[x];
        used[x]++;
        i++;
    }
    return body;    
};
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
    }
};
util.getDate = function() {
    let offset = -5;
    return new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace('GMT', 'CST' ); 
};
util.fixTerminals = function(spawn1,creep) {
    if(spawn1.room.terminal && _.sum(spawn1.room.terminal.store) > 290000) {
        for(let rss in spawn1.room.terminal.store) {
            if(creep.withdraw(spawn1.room.terminal, rss, _.sum(spawn1.room.terminal.store) - 290000) != OK) {
                creep.moveTo(spawn1.room.terminal);
            } 
            creep.drop(rss);
        }
    }
}