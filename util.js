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

function getSum(arr,attr="") {
    let sum = 0;
    Object.keys(arr).forEach(function(b) {
        sum += arr[b].amt;
    });   
    return sum; 
};

let util = {
    dynamicallyBuildBody: function(roles,role,energy) {
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
    },
    goClaim: function(home,target) {
        return Game.rooms[home].find(FIND_MY_SPAWNS)[0].spawnCreep(
            [TOUGH,CLAIM,MOVE,MOVE,MOVE],
            "claimer-"+home,
            { memory: { home: home, role: "claimer", targetRoom: target } }
        );
    }
};

module.exports = util;