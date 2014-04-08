"use strict";
function GameScene()
{
	this.player = null;
	this.currentRoom = null;
}

GameScene.method("setCurrentRoom", function (newroom)
{
	this.currentRoom = newroom;
	OutputToWindow(newroom.getLongDescription());
});

GameScene.method("setPlayerObject", function (player)
{
	this.player = player;
});

var g_time = new Date(2012, 6, 12, 18, 0, 0, 0); // randomly taking 6pm on june 12th 2012
var g_scene = new GameScene();
var g_extantObjects = new Array();

