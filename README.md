# RSSchool NodeJS websocket task template
> Static http server and base task packages. 
> By default WebSocket client tries to connect to the 3000 port.

## Installation
1. Clone/download repo
2. `npm install`

## Usage

Command* | Description
--- | ---
`npm run start:dev` | App served `http://localhost:8181` with nodemon
`npm run start` | App served  `http://localhost:8181` without nodemon

--- 
 *replace `npm` with `yarn` in `package.json` if you use yarn.


## Notes

* User is validated by name: only one user can have same certain name. Password is checked while 'reg' operation.

* User leaves during the game -> his opponent wins. User leaves and has a room -> room gets deleted.

*  One user can create only 1 room. Any other user can join it. User can't join it's own room. It's allowed for one user to join several rooms of different players.

* Game has a single play mode (game with bot). Bot is not really smart, but it's really random 😊 

* Winners table is displayed and sorted for users with at least 1 win. Win in bot-game is not counted as a real win for winners table.

