"use strict";
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function getUrlVars()
{
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++)
	{
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function Init()
{
	// get url vals
	var urlVars = getUrlVars();

	/*
	if (urlVars["word"])
	{
		var wordOk = checkDictionary(urlVars["word"]);
		alert(urlVars["word"] + " " + wordOk + " " + getScore(urlVars["word"]));
	}
	*/

	window.addEventListener('keydown', ev_keydown, false);

	var testRoomA = g_factory.CreateTestRoomA();
	g_scene.setCurrentRoom(testRoomA);
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function ev_keydown(ev)
{
	// refocus the command box
	document.commandBox.command.focus();
	if (ev.which == 38 || ev.which == 40) // up or down
	{

		g_commandIdx += ev.which == 38 ? -1 : 1;

		if (g_commandIdx < 0)
			g_commandIdx = 0;

		if (g_commandIdx >= g_enteredCommands.length)
		{
			g_commandIdx = g_enteredCommands.length;
			document.commandBox.command.value = "";
		}
		else
		{
			document.commandBox.command.value = g_enteredCommands[g_commandIdx];
		}
	}
	else if (ev.which == 27) //esc
	{
		g_commandIdx = g_enteredCommands.length;
		document.commandBox.command.value = "";
	}
}



