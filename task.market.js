let config = require('config');

let taskMarket = module.exports;
taskMarket.run = function(spawns) {
    let spawn1 = spawns[0];
    let terminal = spawn1.room.terminal;
    let storage = spawn1.room.storage;
    
    //act on existing buy orders in the market, with our surplus
    if(terminal && terminal.cooldown == 0 && Game.time % 10 == 0) {
        let amtToSell = 1000;
        let maxEnergyCost = 2500;
        let reserveAmt = 21000;
        let minimumPrice = 0.9;
        for(let rss in terminal.store) {
            if(rss == RESOURCE_ENERGY || rss == RESOURCE_POWER || rss == RESOURCE_OPS) continue;
            if(terminal.store[RESOURCE_ENERGY] > maxEnergyCost && terminal.store[rss] > reserveAmt) {
                // console.log("Room: " + spawn1.room.name + ": checking market for " + rss);
                let orders = Game.market.getAllOrders(
                    (order) => (order.resourceType == rss &&
                                order.type == ORDER_BUY &&
                                order.active == true &&
                                Game.market.calcTransactionCost(amtToSell, spawn1.room.name, order.roomName) < maxEnergyCost * 0.9))
                        .sort(function(a,b) { return b.price - a.price; }
                );
                if(orders.length > 0 && orders[0].price >= minimumPrice) {
                    if(Game.market.deal(orders[0].id, amtToSell, spawn1.room.name) == OK) {
                        // Game.notify("Room: " + spawn1.room.name + ": Order to sell " + amtToSell + " of " + rss + " completed for " + orders[0].price * amtToSell + " credits (" + orders[0].price + "/ea).");
                        break;
                    }
                }
            }
        }
    }

    //equalize resources between rooms
    if(terminal && terminal.cooldown == 0 && storage) {
        if(terminal.store[RESOURCE_ENERGY] > 15000 && storage.store[RESOURCE_ENERGY] > config.energyShareThreshold &&
            terminal.effects && terminal.effects.length > 0) {
            let rooms = _.filter(Game.rooms, r => (r.controller && r.controller.my && 
                                r.terminal && _.sum(r.terminal.store) < 290000 &&
                                Game.market.calcTransactionCost(5000, spawn1.room.name, r.name) < 9000));
            if(rooms.length > 0) {
                let choice = global.util.randomIntFromInterval(0,rooms.length-1);
                if(terminal.send(RESOURCE_ENERGY, 5000, rooms[choice].name) == OK) {
                    console.log("Sent 5000 energy to " + rooms[choice].name);
                }
            }
        }
    }
};
taskMarket.name = "market";