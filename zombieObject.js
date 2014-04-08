"use strict";
//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
function ZombieObject()
{
	this.init("Zombie");
}

// Do the inheritance!
ZombieObject.inherits(LivingObject);

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ZombieObject.method('init', function (typeName)
{
	// base init
	this.uber("init", typeName);
	this.speed = 0.3;

	this.costToAttack = 1;
	this.costToMove = 1;
	this.isHostile = true;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ZombieObject.method('onInfect', function (typeName)
{
	// zombie dgaf
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ZombieObject.method('onInfectionComplete', function (typeName)
{
	// zombie dgaf
});


//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ZombieObject.method('onTakeDamage', function (amt, area)
{
	if (this.isAlive == false)
		this.onBreakApart();
	else
		this.uber("onTakeDamage", amt, area);
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ZombieObject.method('onAttack', function (other)
{
	console.log("zombie attacking!");
	this.uber("onAttack", other);
	this.actionPoints -= this.costToMove;
	other.onTakeDamage(10, "face");
	other.onInfect();
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ZombieObject.method('onBreakApart', function ()
{
	this.uber("onBreakApart");
	this.onTellableAction("The corpse of the zombie tears into multiple pieces leaving a mess on the floor.");
	this.objectThisIsIn.longDescription += "There is a smear of blood and body parts on the floor";
	this.objectThisIsIn.removeObject(this);
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ZombieObject.method('onDie', function ()
{
	this.uber("onDie");
	this.onTellableAction("The zombie collapses to the floor and stops moving.");
	this.shortDescription = "a dead zombie lying on the ground";
	this.longDescription = "a dead " + this.longDescription;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ZombieObject.method('onTurn', function ()
{
	if (this.isAlive == false)
		return;

	this.uber("onTurn");
	console.log("Zombie turn " + this.actionPoints);

	var tookAction = false;
	var humanInRoom = this.objectThisIsIn.findAnObjectOfType(HumanObject, false);
	if (humanInRoom)
	{
		if (this.actionPoints >= this.costToAttack)
		{
			console.log("zombie attacking!");
			if (humanInRoom && humanInRoom.hp > 0)
				this.onAttack(humanInRoom);
			else
			{
				this.onEat(humanInRoom);
				humanInRoom.longDescription += "  The corpse has been stripped of most of it's flesh."
			}
			tookAction = true;
		}
	}
	else if (this.actionPoints >= this.costToMove)
	{
		console.log("zombie moving!");
		// find the most interesting exit
		var mostInterest = 0;
		var whereToGo = null;

		// 
		for (var exitObjIdx in this.objectThisIsIn.exits)
		{
			var exitObj = this.objectThisIsIn.exits[exitObjIdx];
			if (exitObj.zombieInterest > mostInterest)
			{
				mostInterest = exitObj.zombieInterest;
				whereToGo = exitObj;
			}
		}

		// found somewhere we want to go
		if (whereToGo)
		{
			this.onMove(whereToGo);
			tookAction = true;
		}
	}

	if (!tookAction)
	{
		this.onTellableAction("The zombie shambles towards you but can't reach yet.");
	}
});



