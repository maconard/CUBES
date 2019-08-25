let taskGarbage = module.exports;
taskGarbage.run = function() {
    if(Game.time % 250 == 0) {
        for(let i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }

        for(let i in Memory.roomData) {
            if((Game.rooms[i] && Game.rooms[i].controller && !Game.rooms[i].controller.my) || !Game.rooms[i]) {
                delete Memory.roomData[i];
            }
        }
    
        _.toArray(Game.rooms).forEach(function(r) {
            if(!Memory.roomData[r.name]) return;
            let travelDat = Memory.roomData[r.name].travelData;
            for(key in travelDat) {
                travelDat[key] -= 2;
                if(travelDat[key] <= 0) {
                    delete Memory.roomData[r.name].travelData[key];
                }
            };
        });
    }
};
taskGarbage.name = "garbage";