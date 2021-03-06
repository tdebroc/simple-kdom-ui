
// Need:
// npm install -g local-cors-proxy
// lcp --proxyUrl http://localhost



var phonecatApp = angular.module('phonecatApp', []);

phonecatApp.controller('PhoneListController', ['$scope', '$http', function PhoneListController($scope, $http) {
  $scope.numberOfPlayers = 2;

  $scope.nineElements = [-4,-3,-2,-1,0,1,2,3,4];
  var gameMaps;
  var currentGameId;
  function refreshGames() {
    var allGames = [];
    $http.get(SERVER_URL + ':8010/proxy/new-games/').then(function(response) {
        allGames = response.data.newGames;
        $http.get(SERVER_URL + ':8010/proxy/games/').then(function(response) {
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
        if (!isGameStarted(game)) {
            buildNewGameAsCurrentGame(game);
            return;
        }
        $http.get(SERVER_URL + ':8010/proxy/games/' + gameId).then(function(response) {
            $scope.currentGame = response.data;
            buildGameMaps($scope.currentGame);
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
      gameMaps = {};
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
    setTimeout(refreshGame, 500);
  }
  refreshGame();

  function refreshGameTimer() {
      refreshGames();
      setTimeout(refreshGameTimer, 1500);
  }
  refreshGameTimer();


  $scope.getGameMap = function(playerIndex, i, j) {
    if (!gameMaps || !gameMaps[playerIndex]) return undefined;
    return gameMaps[playerIndex][getCaseKey(i, j)];
  }



  $scope.getGridClass = function(playerIndex, i, j) {
    if (i == 0 && j == 0) return "castle";
    var placedTile = $scope.getGameMap(playerIndex, i, j);
    return placedTile ? placedTile.terrain : "empty";
  }
  $scope.getCrownCount = function(playerIndex, i, j) {
      var placedTile = $scope.getGameMap(playerIndex, i, j);
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

  function buildGameMaps(game) {
    gameMaps = {};
    for (var i = 0; i < game.kingdoms.length; i++) {
        var kingdom = game.kingdoms[i];
        var gameMap = {};
        for (var j = 0; j < kingdom.placedTiles.length; j++) {
            var placedTile = kingdom.placedTiles[j];
            gameMap[getCaseKey(placedTile.position.row, placedTile.position.col)] = placedTile.tile;
        }
        gameMaps[i] = gameMap;
    }
  }

  $scope.createGame = function() {
    $http.post(SERVER_URL + ':8010/proxy/new-games/?playerCount=' + $scope.numberOfPlayers)
         .then(refreshGames)

  }

  function getCaseKey(line, col) {
    return line + "#" + col;
  }

  $("#gameList").height($(window).height() - $("#gameList").offset().top - 100)

}
]);