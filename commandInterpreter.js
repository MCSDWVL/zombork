"use strict";

//-----------------------------------------------------------------------------
// Some state tracking stuff?
var g_turn = 0;
var g_enteredCommands = new Array();
var g_commandIdx = 0;

//-----------------------------------------------------------------------------
// Commands!
var lookAtCommands = ["look at", "examine"];
var lookCommands = ["look", "look around"];
var takeCommands = ["take", "pickup", "get"];
var attackCommands = ["attack", "hit", "shoot", "chop", "punch", "kick", "fight", "kill", "murder", "destroy", "assault"];
var eatCommands = ["eat", "drink", "consume"];
var moveCommands = ["go", "run", "move"];
var equipCommands = ["equip", "wear"];
var waitCommands = ["wait", "sleep"];
var dropCommands = ["drop"];
var putCommands = ["put", "place", "store"];
var combineCommands = ["use"];

//-----------------------------------------------------------------------------
// Command a little class to hold commands with a bunch of synonyms
function Command(verbs, numNouns, nounOptional, actionFunc)
{
	this.verbs = verbs;
	this.numNouns = numNouns;
	this.optional = nounOptional;
	this.actionFunc = actionFunc;
	
	//-------------------------------------------------------------------------
	this.VerbMatch = function (str)
	{
		for (var i in verbs)
		{
			if (str.search(verbs[i]) >= 0)
			{
				return true;
			}
		}

		return false;
	}
}

//-----------------------------------------------------------------------------
// Create a bunch of command objects for each synonym-set of actions
var commands = [	new Command(lookAtCommands,		1, false,	onLookAt),
					new Command(lookCommands,		1, true,	onLook),
					new Command(takeCommands,		1, false,	onGet),
					new Command(attackCommands,		1, false,	onAttack),
					new Command(eatCommands,		1, false,	onEat),
					new Command(moveCommands,		1, false,	onMove),
					new Command(equipCommands,		1, false,	onEquip),
					new Command(waitCommands,		0, false,	onWait),
					new Command(dropCommands,		1, false,	onDrop),
					new Command(putCommands,		2, false,	onPut),
					new Command(combineCommands,	2, false,	onCombine)
					];

//-----------------------------------------------------------------------------
//
function LookForVerb(str)
{
	for(var i in commands)
	{
		if(commands[i].VerbMatch(str))
		{
			return i;
		}
	}
	return -1;
}

//-----------------------------------------------------------------------------
//
function GetStringWithoutVerb(str)
{
	var strMinusVerb = str.replace(str.split(' ')[0], "");

	// trim white space
	strMinusVerb = strMinusVerb.replace(/^\s+|\s+$/g, '');

	return strMinusVerb;
}

//-----------------------------------------------------------------------------
// Strip out a bunch of prepositions (we don't really care where the user THINKS something is)
function GetSimpleString(strIn)
{
	var str = strIn;
	str = str.replace(/\bthe\b/g, '');
	str = str.replace(/\bat\b/g, '');
	str = str.replace(/\bin\b/g, '');
	str = str.replace(/\bon\b/g, '');
	str = str.replace(/\bwith\b/g, '');
	str = str.replace(/\busing\b/g, '');

	str = str.toLowerCase();
	return str;
}

//-----------------------------------------------------------------------------
// Find a noun in the current room or in the players inventory
function LookForNoun(nounName)
{
	var found = null; 
	if (g_scene && g_scene.currentRoom)
		found = g_scene.currentRoom.findNoun(nounName);
	if (!found)
		found = g_scene.player.findNoun(nounName);
	
	return found;
}

//-----------------------------------------------------------------------------
//
function ParseNumTimes(str)
{
	var numTimesArray = str.match(/x\s*\d+$/i);
	var numTimes = 1;

	if(numTimesArray)
	{
		// get rid of the x
		var numtimestr = numTimesArray[0].replace(/x/i, '');

		// parse the number
		numTimes = parseInt(numtimestr);
	}

	return numTimes != NaN && numTimes > 0 ? numTimes : 1;
}

//-----------------------------------------------------------------------------
//
function RemoveNumTimes(str)
{
	str = str.replace(/x\s*\d+$/i, '');
	return str;
}

//-----------------------------------------------------------------------------
//
function ParseUserCommand(command)
{
	// add the command to our list
	g_enteredCommands.push(command);
	g_commandIdx = g_enteredCommands.length;

	// strip prepositions and figure out where the verb is
	var str = GetSimpleString(command);
	var commandIdx = LookForVerb(str);	

	// did we find a valid command word?
	if (commandIdx >= 0)
	{
		// remove the verb from the simple string... since we stripped the prepositions this should make everything else nouns
		var nounStr = GetStringWithoutVerb(str);

		// get any repeat info
		var numTimes = ParseNumTimes(nounStr);
		nounStr = RemoveNumTimes(nounStr);

		// TODO - just splitting doesn't work!  Some objects might have two word names!
		//					THIS is bug: "- BUG can't use 2 word names for things"
		var nouns = nounStr.length > 0 ? nounStr.split(' ') : [];
		var numNouns = nouns.length;
		var nounObjects = new Array();

		if (numNouns == commands[commandIdx].numNouns || (commands[commandIdx].numNouns > numNouns && commands[commandIdx].optional))
		{
			var gotAllNouns = true;
			for (var nidx in nouns)
			{
				var noun = LookForNoun(nouns[nidx]);
			
				if (noun)
				{
					nounObjects.push(noun);
				}
				else
				{
					OutputToWindow("Sorry I don't know what " + nouns[nidx] + " is.");
					gotAllNouns = false;
					break;
				}

			}

			if (gotAllNouns)
			{
				for(var i = 0; i < numTimes; ++i)
				{
					// Don't let the dead do anything
					var dead = g_scene.player.hp < 0 || g_scene.player.isAlive == false;
					if (dead)
						OutputToWindow("You are dead.  You can't do anything now.");

					var didSomething = !dead && commands[commandIdx].actionFunc(nounObjects);
					if(didSomething == false)
					{
						break;
					}
					else
					{
						g_turn++;
						g_time.setMinutes(g_time.getMinutes() + 1);
						for (var idx in g_extantObjects)
						{
							g_extantObjects[idx].onTurn();
						}
					}
				}
			}
		}
		else
		{
			OutputToWindow("You can't do that to that many things. (Try using one word names for things)");
			console.log("wrong number args " + numNouns + " " + commands[commandIdx].numNouns);
		}
	}
	else
	{
		OutputToWindow("Sorry I don't know how to " + str);
	}
}

//-----------------------------------------------------------------------------
// 
function onLookAt(nouns)
{
	OutputToWindow(nouns[0].getLongDescription());
	return false;
}

//-----------------------------------------------------------------------------
// 
function onLook(nouns)
{
	return onLookAt([g_scene.currentRoom]);
}

//-----------------------------------------------------------------------------
// 
function onGet(nouns)
{
	if (nouns[0].canGet())
	{
		nouns[0].moveTo(g_scene.player);
		OutputToWindow("You pickup the " + nouns[0].nounName);
		return true;
	}
	else
	{
		OutputToWindow("You can't pick that up. ");
	}
}


//-----------------------------------------------------------------------------
// 
function onAttack(nouns)
{
	return g_scene.player.onAttack(nouns[0]);
}

//-----------------------------------------------------------------------------
// 
function onEquip(nouns)
{
	if (g_scene.player.equip(nouns[0]))
	{
		OutputToWindow("You equip the " + nouns[0].nounName);
		return true;
	}
	else
	{
		OutputToWindow("That probably wouldn't make a good weapon");
		return false;
	}
}


//-----------------------------------------------------------------------------
// 
function onEat(nouns)
{
	if (g_scene.player.onEat(nouns[0]))
	{
		OutputToWindow("You consume the " + nouns[0].nounName + ".  ");
		if (nouns[0].hungerChangeOnEat < 0)
			OutputToWindow("You feel less hungry.  ");

		if (nouns[0].infectionOnEat > 0 || nouns[0].insanityChangeOnEat > 0)
			OutputToWindow("You feel slightly ill.  ");

		if (nouns[0].thirstChangeOnEat < 0)
			OutputToWindow("You feel less thirsty.  ");

		if (nouns[0].exhaustionChangeOnEat < 0)
			OuputToWindow("You feel less tired.  ");
		return true;
	}
	else
	{
		OutputToWindow("Eating " + nouns[0].nounName + " would probably be a bad idea.");
	}
}

//-----------------------------------------------------------------------------
// 
function onMove(nouns)
{
	if (nouns[0].isExit)
	{
		g_scene.player.moveTo(nouns[0]);
		g_scene.setCurrentRoom(nouns[0]);
		return true;
	}
	OutputToWindow("That's not a viable exit.  ");
	return false;
}

//-----------------------------------------------------------------------------
// 
function onWait(nouns)
{
	OutputToWindow("You rest for a bit");
	return true;
}

//-----------------------------------------------------------------------------
// 
function onDrop(nouns)
{
	OutputToWindow("TODO");
	return false;
}

//-----------------------------------------------------------------------------
// 
function onPut(nouns)
{
	OutputToWindow("TODO");
	return false;
}

//-----------------------------------------------------------------------------
// 
function onCombine(nouns)
{
	OutputToWindow("TODO");
	return false;
}
