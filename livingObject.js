"use strict";
//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
function LivingObject()
{
	this.init("LivingObject");
}

// Do the inheritance!
LivingObject.inherits(GameObject);

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
LivingObject.method('init', function (typeName)
{
	// base init
	this.uber("init", typeName);

	//
	this.isAlive = true;
	this.hp = 100;
	this.hunger = 0;
	this.pain = 0;
	this.thirst = 0;
	this.exhaustion = 0;
	this.infection = 0;
	this.insanity = 0;

	this.canMove = true;
	this.canGrab = true;
	this.canBite = true;

	this.isAsleep = false;

	this.equipped = null;

	this.speed = 1;
	this.actionPoints = 0;
	this.costToAttack = 1;
	this.costToMove = 1;

	this.isHostile = false;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
LivingObject.method('onTakeDamage', function (amt, area)
{
	this.onTellableAction(this.nounName + " gets hit for " + amt + " damage");
	this.hp -= amt;

	if (this.hp <= 0)
		this.onDie();
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
LivingObject.method('onBreakApart', function ()
{
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
LivingObject.method('onInfect', function ()
{
	this.infection++;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
LivingObject.method('onAttack', function (other)
{
	this.onTellableAction(this.nounName + " attacks " + other.nounName + (this.equipped ? " with " + this.equipped.nounName + "." : "."));
	this.actionPoints -= this.costToAttack;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
LivingObject.method('onMove', function (other)
{
	this.onTellableAction(this.nounName + " moves away from you, out of " + exit.shortDescription);
	this.moveTo(other);
	this.actionPoints -= this.costToMove;	
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
LivingObject.method('onInfectionComplete', function ()
{
	if (this.isPlayer())
	{
		this.onTellableAction("You have become one of the undead.");
		this.alive = false;
	}
	else
	{
		this.onTellableAction(this.nounName + "Has become a zombie.");
		g_factory.CreateZombie(this.objectThisIsIn);
		this.objectThisIsIn.removeObject(this);
	}
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
LivingObject.method('onDie', function ()
{
	this.onTellableAction(this.nounName + " falls to the ground. ");
	this.isAlive = false;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
LivingObject.method('onTurn', function ()
{
	this.actionPoints += this.speed;
	if (this.infection > 100)
	{
		this.onInfectionComplete();
	}

	// infection grows
	if (this.infection > 0)
		this.infection++;

	// hunger grows, let's say you have to eat every day if you're to stay in fighting shape
	// these numbers are arbitrary!
	var mustEatTimesPerDay = 1;
	var mustDrinkTimesPerDay = 3;
	this.hunger += (100) / (24 * 60 / mustEatTimesPerDay);
	this.thirst += (mustDrinkTimesPerDay * 100) / (24 * 60);

	// should sleep 4 hours (?) a day minimum
	var hoursOfSleep = 4;
	var hoursOfAwake = 24 - hoursOfSleep;
	if (this.isAsleep)
		this.exhaustion -= 100 / (hoursOfSleep * 60);
	else
		this.exhaustion += 100 / (hoursOfAwake * 60);

	// check for DEATH
	if (this.isAlive && (this.hunger >= 100 || this.thirst >= 100 || this.exhaustion >= 100 || this.insanity >= 100 || this.infection >= 100))
	{
		this.isAlive = false;
		this.onDie();
	}
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
LivingObject.method('onEat', function (food)
{
	if (food.isEdible == false)
		return false;
	this.actionPoints -= 1;
	this.hunger			= Math.max(this.hunger + food.hungerChangeOnEat, 0);
	this.infection		= Math.max(this.infection + food.infectionOnEat, 0);
	this.insanity		= Math.max(this.insanity + food.insanityChangeOnEat, 0);
	this.thirst			= Math.max(this.thirst + food.thirstChangeOnEat, 0);
	this.exhaustion		= Math.max(this.exhaustion + food.exhaustionChangeOnEat, 0);

	this.onTellableAction(this.nounName + " eats the " + food.nounName)
	return true;
});





