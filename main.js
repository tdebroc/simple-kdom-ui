
// Need:
// npm install -g local-cors-proxy
// lcp --proxyUrl http://localhost

var phonecatApp = angular.module('phonecatApp', []);

phonecatApp.controller('PhoneListController', ['$scope', '$http', function PhoneListController($scope, $http) {
  $scope.numberOfPlayers = 2;

  $scope.nineElements = [-4,-3,-2,-1,0,1,2,3,4];
  var gameMap = {};
  var currentGameId;
  function refreshGames() {
    var allGames = [];
    $http.get('http://localhost:8010/proxy/new-games/').then(function(response) {
        allGames = response.data.newGames;
        $http.get('http://localhost:8010/proxy/games/').then(function(response) {
            pushAll(allGames, response.data.games);
            $scope.games = allGames;
            if (!currentGameId) {
                $scope.selectGame($scope.games[0].uuid)
            }
        });
      });


  }

  function pushAll(initArray, newArray) {
    for (var i = 0; i < newArray.length; i++) {
        initArray.push(newArray[i]);
    }
  }


  $scope.selectGame = function(gameId) {
        if (!gameId) return;
        currentGameId = gameId;
        var game = getGameFromGameList(gameId);
        console.log(game)
        if (!isGameStarted(game)) {
            buildNewGameAsCurrentGame(game);
            return;
        }
        $http.get('http://localhost:8010/proxy/games/' + gameId).then(function(response) {
            $scope.currentGame = response.data;
            buildGameMap($scope.currentGame);
        });
  }

  function getGameFromGameList(gameId) {
    for (var i = 0; i < $scope.games.length; i++) {
      if ($scope.games[i].uuid == gameId) {
        return $scope.games[i];
      }
    }
    return null;
  }

  function isGameStarted(game) {
    return game.round;
  }

  function buildNewGameAsCurrentGame(game) {
      $scope.currentGame = game;
      $scope.currentGame.kingdoms = [];
      for (var i = 0; i < game.joinedPlayers.length; i++) {
        var player = {
            player : game.joinedPlayers[i]
        };
        player.score = {total : 10}
        $scope.currentGame.kingdoms.push(player)
      }
  }

  function refreshGame() {
    if ($scope.currentGame && !$scope.currentGame.gameOver) {
        $scope.selectGame(currentGameId);
    }
    setTimeout(refreshGame, 300);
  }
  refreshGame();

  function refreshGameTimer() {
      refreshGames();
      setTimeout(refreshGameTimer, 1500);
  }
  refreshGameTimer();


  $scope.getGameMap = function(i, j) {
    return gameMap[getCaseKey(i, j)];
  }



  $scope.getGridClass = function(i, j) {
    if (i == 0 && j == 0) return "castle";
    var placedTile = gameMap[getCaseKey(i, j)];
    return placedTile ? placedTile.terrain : "empty";
  }
  $scope.getCrownCount = function(i, j) {
      var placedTile = gameMap[getCaseKey(i, j)];
      return placedTile ? (placedTile.crowns > 0 ? placedTile.crowns : " ") : " ";
    }

  $scope.getArrayCrowns = function(i, j) {
      var crownCount = $scope.getCrownCount(i, j);
      var arr = [];
      for (var i = 0; i < crownCount; i++) {
        arr.push(i);
      }
      return arr;
    }

  function buildGameMap(game) {
    gameMap = {};
    for (var i = 0; i < game.kingdoms.length; i++) {
        var kingdom = game.kingdoms[i];
        for (var i = 0; i < kingdom.placedTiles.length; i++) {
            var placedTile = kingdom.placedTiles[i];
            gameMap[getCaseKey(placedTile.position.row, placedTile.position.col)] = placedTile.tile;
        }
    }
  }

  $scope.createGame = function() {
    console.log($scope.numberOfPlayers);
    $http.post('http://localhost:8010/proxy/new-games/?playerCount=' + $scope.numberOfPlayers)
         .then(refreshGames)

  }

  function getCaseKey(line, col) {
    return line + "#" + col;
  }

}
]);