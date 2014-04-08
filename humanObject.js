"use strict";
//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
function HumanObject()
{
	this.init("HumanObject");
}

// Do the inheritance!
HumanObject.inherits(LivingObject);

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
HumanObject.method('init', function (typeName)
{
	// base init
	this.uber("init", typeName);
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
HumanObject.method('equip', function (obj)
{
	if (obj.addedDamage != 0)
	{
		this.equipped = obj;
		return true;
	}
	
	return false;
});


//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
HumanObject.method('onTakeDamage', function (amt, area)
{
	this.uber("onTakeDamage", amt, area);
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
HumanObject.method('onTakeInfection', function ()
{
	this.uber("onTakeInfection", amt, area);
	this.infection += 1;
	if (this.infection >= 100)
	{
		// TODO become a zombie
		this.onDie();
	}
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
HumanObject.method('onAttack', function (other)
{
	this.uber("onAttack", other);
	this.actionPoints -= 1;

	if (this.equipped)
		other.onTakeDamage(10 + this.equipped.addedDamage, "face");
	else
		other.onTakeDamage(1, "face"); // don't punch zombies
});

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
HumanObject.method('onDie', function ()
{
	this.uber("onDie");
	this.shortDescription += "  They're dead.";
	this.longDescription += "  They're dead.";
});




