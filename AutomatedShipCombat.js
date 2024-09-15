function weapon(name, toHit, numberOfDice, damageDice, crewNeeded) {
    // Constructor
    {
        this.name = name;
        this.toHit = toHit;
        this.numberOfDice = numberOfDice;
        this.damageDice = damageDice;
        this.crewNeeded = crewNeeded;
        this.readyToFire = 0;
    }

    // Methods
    {
        this.fire = function(target) {
            let currentRoll = Math.floor(Math.random() * 20 + 1) + this.toHit;
            if(currentRoll >= target.ac) {
                return true;
            }
            return false;
        }
    
        this.damage = function() {
            return this.numberOfDice * Math.floor(Math.random() * this.damageDice + 1);
        }

    }
}

function ship(name, hp, ac, damageTreshhold, crew, weapons = [], initiative, target = null) {
    // Constructor
    {
        this.name = name;
        this.hp = hp;
        this.ac = ac;
        this.damageThreshold = damageTreshhold;
        this.crew = crew;
        this.weapons = weapons;
        this.initiative = initiative;
        this.target = target;
    }

    // Methods
    {
        this.fullAttack = function(target = this.target) {
            for(let i=0; i<this.weapons.length; i++) {
                this.attack(target, this.weapons[i]);
            }
        }
    
        this.attack = function(target, weapon) {
            // Assign crew to load weapon
            let crewProvided = 0;
            if(this.crew.available >= weapon.crewNeeded) {
                crewProvided = weapon.crewNeeded;
                this.crew.available -= weapon.crewNeeded;
            }
            else {
                crewProvided = this.crew.available;
                this.crew.available = 0;
            }
            weapon.readyToFire += crewProvided;
            
            if(weapon.readyToFire >= weapon.crewNeeded) {
                weapon.readyToFire -= weapon.crewNeeded;

                if(weapon.fire(target)){
                    let damage = weapon.damage();
                    if(damage >= target.damageThreshold){
                        target.hp -= damage;
                        console.log(`${this.name} hit ${target.name} with a ${weapon.name} for ${damage} damage!`);
                        if(target.hp > 0){
                            console.log(`${target.name} now has ${target.hp} health left`);
                        }
                        else{
                            this.target = null;
                            console.log(`${this.name} has destroyed ${target.name}.`);
                        }
                    }
                    else{
                        console.log(`${this.name} hit ${target.name} with a ${weapon.name}, but the damage didn't seem to stick!`);
                    }
                }
                else{
                    console.log(`${this.name} missed ${target.name} with a ${weapon.name}.`);
                }
            }
            else {
                console.log(`${this.name} needs more available crew to load ${weapon.name}.`);
            }

        }

        this.refreshCrew = function() {
            this.crew.available = this.crew.total;
        }
    }

}

function crew(total, averageHp, currentCrewMemberHp = averageHp) {
    // Constructor
    {
        this.total = total;
        this.averageHp = averageHp;
        this.available = total;
        this.currentCrewMemberHp = currentCrewMemberHp;
    }
}

function sortInitiative(initiative){
    for(let i=0; i<initiative.length - 1; i++){
        for(let j=0; j<initiative.length - 1; j++){
            if(initiative[j].initiative < initiative[j+1].initiative){
                [initiative[j],initiative[j+1]] = [initiative[j+1],initiative[j]];
            }
        }
    }

    return initiative;
}

function battle(initiative, round = 1){
    let battleOngoing = true;

    while(battleOngoing){
        console.log(`~~~~~~~~~~  Round ${round}  ~~~~~~~~~~`);
        for(let i=0; i<initiative.length; i++){
            let attacker = initiative[i], target = initiative[i].target;
            
            if(attacker.hp > 0 && target.hp > 0){
                attacker.refreshCrew();
                
                attacker.fullAttack(target);
                
                if(target.hp <= 0){
                    let index = initiative.indexOf(target);
                    initiative.splice(index,1);
                    battleOngoing = false;
                }
            }
        }
        round++;
    }
}


// Available Weapons
let Ballistae = new weapon("Ballistae", 6, 3, 10, 3);
let Mangonel = new weapon("Mangonel", 5, 5, 10, 5);
let Cannon = new weapon("Cannon", 6, 16, 10, 4);

// Initialize ships
let MikenShip = new ship("Miken's  Galleon", 377, 15, 15, new crew(20, 25), [Mangonel, Ballistae, Ballistae], 9);
let MercaneGalleon = new ship("Mercane Galleon", 380, 15, 15, new crew(20, 25), [Mangonel, Ballistae, Ballistae], 10);
let WrestlerBombard = new ship("Wrestler Bombard", 300, 15, 20, new crew(12, 123), [Cannon, Ballistae, Ballistae], 15);
let MercaneBombard = new ship("Mercane Bombard", 211, 15, 20, new crew(12, 60, 18), [Cannon, Ballistae, Ballistae], 5);


// Set Targets
MikenShip.target = MercaneGalleon;
MercaneGalleon.target = MikenShip;
WrestlerBombard.target = MercaneBombard;
MercaneBombard.target = WrestlerBombard;

// Roll Initiative
let combatOrder = sortInitiative([MikenShip, MercaneGalleon, WrestlerBombard, MercaneBombard]);