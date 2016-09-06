# MOArcade - Multiplayer Online Arcade

An attempt to create a simple console-style multiplayer gaming platform for the web using socket communication.

Play here: http://moarcade.herokuapp.com/

## How it works

- A desktop browser opens the MOArcade homepage and starts a game. This browser serves as a gaming screen and a host for the players to join.
- Players join the game using their mobile phones (either by using a QR scanner or by typing the join URL). The phone browsers serve as gaming controllers - they display basic controller UI while the whole gaming action takes place on the desktop host browser.