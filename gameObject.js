"use strict";
//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
var MAX_LIFTABLE_WEIGHT = 100;

//-----------------------------------------------------------------------------
function GameObject()
{
	this.init("GameObject");
}

//-----------------------------------------------------------------------------
GameObject.method('init', function (typeName)
{
	this.weight = -1;

	// container stuff
	this.isContainer = false;
	this.canOpen = false;
	this.isOpen = false;

	// can people go inside this object
	this.canGoInside = false;
	this.exits = new Array();
	this.isAnExit = false;

	// what other objects are inside of this object (as in rooms, backpacks, buses)
	this.objectsInThisObject = new Array();

	// added damage value when using this item as a weapon
	this.addedDamage = 0;

	this.nounName = "";

	// consumption properties of the item
	this.edible = false;
	this.infectionOnEat = 0; 		// can be + or - for bad flesh or medicine
	this.hungerChangeOnEat = 0; 	// can be + or -, - means it makes the healthy sick
	this.thirstChangeOnEat = 0;
	this.exhaustionChangeOnEat = 0;
	this.insanityChangeOnEat = 0;

	// what is this object inside of?
	this.objectThisIsIn = null;

	// short and long descriptions!
	this.shortDescription = ""; 	// for describing it as part of a scene
	this.longDescription = ""; 		// for describing it when examined directly
	this.positionDescription = ""; 	// position of this object relative to any object it's contained in
	this.knownProperName = ""; 		// if we know a proper name we don't want to say "there is a" etc.

	// how much do zombies want to get to this object
	this.zombieInterest = 0;

	// should we even mention this object (sometimes don't want to, so we can make things like "West" an object the player can go to
	this.describeInLook = true;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('onTellableAction', function (str)
{
	if (g_scene.player.objectThisIsIn == this.objectThisIsIn)
		OutputToWindow(str);
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('isPlayer', function (str)
{
	return g_scene.player == this;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('addObject', function (other)
{
	this.objectsInThisObject.push(other);
	other.objectThisIsIn = this;
	console.log("Adding " + other.nounName + " to " + other.objectThisIsIn.nounName);
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('removeObject', function (other)
{
	for (var inObjIdx in this.objectsInThisObject)
	{
		var inObj = this.objectsInThisObject[inObjIdx];
		if (inObj == other)
		{
			this.objectsInThisObject.splice(inObjIdx, 1);
			break;
		}
	}

	if (other.objectThisIsIn == this)
		other.objectThisIsIn = null;

	console.log("Removing " + other.nounName + " from " + this.nounName);
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('destroy', function ()
{
	var idx = g_extantObjects.indexOf(this);
	if (idx != -1)
		g_extantArray.splice(idx, 1);

	if (this.objectThisIsIn)
		this.objectThisIsIn.removeObject(this);
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('moveTo', function (otherRoom)
{
	this.objectThisIsIn.removeObject(this);
	otherRoom.addObject(this);
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('addExit', function (other)
{
	this.exits.push(other);
	other.isAnExit = true;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('recalcZombieInterest', function ()
{
	// basic game objects are as interesting as their contents
	this.zombieInterest = 0;
	for (var inObjIdx in this.objectsInThisObject)
	{
		var inObj = this.objectsInThisObject[inObjIdx];
		this.zombieInterest += inObj.zombieInterest;
	}

	// room objects get a small amount of interest from connected rooms
	for (var exitObjIdx in this.exits)
	{
		var exitObj = this.exits[exitObjIdx];
		this.zombieInterest += .10 * exitObj.zombieInterest;
	}
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('matchesString', function (strname)
{
	var nounMatches = this.nounName.toLowerCase() == strname.toLowerCase();
	var shortDescMatches = this.getShortDescription().toLowerCase() == strname.toLowerCase()
	var longDescMatches = this.getLongDescription().toLowerCase() == strname.toLowerCase()

	return nounMatches || shortDescMatches || longDescMatches;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('findNoun', function (strname, recursive)
{
	if (this.matchesString(strname))
		return this;
	else
	{
		// do breadth first
		for (var inObjIdx in this.objectsInThisObject)
		{
			var inObj = this.objectsInThisObject[inObjIdx];
			if (inObj.matchesString(strname))
				return inObj;
		}

		// must go deeper
		if (recursive)
		{
			for (var inObjIdx in this.objectsInThisObject)
			{
				var inObj = this.objectsInThisObject[inObjIdx];
				var found = inObj.findNoun(strname, recursive);
				if (found)
					return found;
			}
		}
	}
	return null;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('isAnExit', function ()
{
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('onBreakApart', function ()
{
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('findAnObjectOfType', function (type, recursive)
{
	for (var inObjIdx in this.objectsInThisObject)
	{
		var inObj = this.objectsInThisObject[inObjIdx];
		if (inObj instanceof type)
			return inObj;
	}

	var foundRecursive = null;
	if (recursive)
		foundRecursive = inObj.findObjectOfType(type, recursive);
	return foundRecursive;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('onTurn', function ()
{
	// recalculate how much zombies want to get to this object
	this.recalcZombieInterest();

	// tell all contained objects to take their turn
	//for (var inObjIdx in this.objectsInThisObject)
	//{
	//	var inObj = this.objectsInThisObject[inObjIdx];
	//	inObj.onTurn();
	//}
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('getShortDescription', function ()
{
	return this.shortDescription;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('getLongDescription', function (value)
{
	var longDesc = this.longDescription;
	longDesc += "\n";

	if (false == this.isContainer || this.isOpen)
	{
		for (var inObjIdx in this.objectsInThisObject)
		{
			var inObj = this.objectsInThisObject[inObjIdx];

			if (false == inObj.describeInLook)
				continue;

			if (inObj.knownProperName.length > 0)
			{
				longDesc += inObj.knownProperName + " is ";
			}
			else
			{
				longDesc += "There is a " + inObj.getShortDescription() + " ";
			}
			longDesc += inObj.getPositionDescription();
			longDesc += "\n";
		}
	}
	return longDesc;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('getPositionDescription', function (value)
{
	return this.positionDescription;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
GameObject.method('canGet', function (other)
{
	return (this.weight >= 0 && this.weight < MAX_LIFTABLE_WEIGHT && !(this.objectThisIsIn instanceof LivingObject && this.objectThisIsIn.isAlive));
	this.objectsInThisObject.push(other);
	other.objectThisIsIn = this;
});



