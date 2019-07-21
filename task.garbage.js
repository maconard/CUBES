var ticks = 0;

var taskGarbage = {
    run: function() {
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }

        ticks++;
        if(ticks % 250 == 0) {
            _.toArray(Game.spawns).forEach(function(s) {
                if(!Memory.roomData[s.room.name]) return;
                var travelDat = Memory.roomData[s.room.name].travelData;
                for(key in travelDat) {
                    travelDat[key] -= 3;
                    if(travelDat[key] <= 0) {
                        delete Memory.roomData[s.room.name].travelData[key];
                    }
                };
            });
        }
    }
}

module.exports = taskGarbage;