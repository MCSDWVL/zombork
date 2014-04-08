"use strict";
//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
function ObjectFactory()
{
}

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ObjectFactory.method("CreateTestRoomA", function ()
{
	var firstRoom = new GameObject();
	firstRoom.shortDescription = "A sterile white testing room. ";
	firstRoom.longDescription = "The room has all white walls.  Nothing appears to be real.  It's as if you're inside a giant test. ";
	firstRoom.nounName = "Test Room A";

	g_extantObjects.push(firstRoom);

	this.CreatePlayer(firstRoom);
	this.CreateZombie(firstRoom);
	this.CreateWeapon(firstRoom);
	this.CreateFood(firstRoom);
	this.CreateDrink(firstRoom);

	return firstRoom;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ObjectFactory.method("AddObjectBase", function (created, inRoom)
{
	if (inRoom)
		inRoom.addObject(created);

	console.log("Adding object " + created.nounName);
	g_extantObjects.push(created);
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ObjectFactory.method("CreatePlayer", function (inRoom)
{
	var created = this.CreateHuman(inRoom);
	created.nounName = "Self";
	g_scene.setPlayerObject(created);
	return created;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ObjectFactory.method("CreateHuman", function (inRoom)
{
	var created = new HumanObject();
	created.shortDescription = "Some dude.";
	created.longDescription = "A dude.  He look totally cool.";
	created.nounName = "Human";

	this.AddObjectBase(created, inRoom);
	return created;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ObjectFactory.method("CreateZombie", function (inRoom)
{
	var created = new ZombieObject();
	created.nounName = "zombie";
	created.shortDescription = "A zombie. ";
	created.longDescription = "One of the living dead.";

	this.AddObjectBase(created, inRoom);
	return created;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ObjectFactory.method("CreateWeapon", function (inRoom)
{
	var created = new GameObject();
	created.addedDamage = 25;
	created.nounName = "Axe";
	created.shortDescription = "A fire axe.  ";
	created.longDescription = "An old fire axe, the kind they use to break down doors.  The head is red with a shiny metal edge.  The handle is made of a light wood.  It feels quite heavy and powerful.  ";
	created.weight = 1;

	this.AddObjectBase(created, inRoom);
	return created;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ObjectFactory.method("CreateFood", function (inRoom)
{
	var created = new GameObject();
	created.nounName = "cheese";
	created.shortDescription = "cheese";
	created.longDescription = "A block of cheddar cheese.  It looks delicious.  ";
	created.weight = 1;
	created.edible = true;
	created.hungerChangeOnEat = -10;

	this.AddObjectBase(created, inRoom);
	return created;
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
ObjectFactory.method("CreateDrink", function (inRoom)
{
	var created = new GameObject();
	created.nounName = "water";
	created.shortDescription = "A bottle of water";
	created.longDescription = "A bottle of water.  The label has been peeled off.  ";
	created.weight = 1;
	created.edible = true;
	created.thirstChangeOnEat = -10;

	this.AddObjectBase(created, inRoom);
	return created;
});



var g_factory = new ObjectFactory();

