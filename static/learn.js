var game = window.dinoGame;
var player = new Player();
var experimentNum = 5;
$.get("/expNum/", function(data){
    experimentNum = int(data.expNumber);
    console.log("experimentNum = " + experimentNum);
});

// create an environment object
var env = {};
env.getNumStates = function() { return 4; }
env.getMaxNumActions = function() { return 3; }

// create the DQN agent
var spec = {alpha: 0.005, experience_size: 100, epsilon: 1.0, num_hidden_units: 1000}
var agent = new RL.DQNAgent(env, spec);

// Variables for graph
var successfulJumpsSinceAvg = 0;
var trialsSinceLastAvg = 0;
var trial = 0;
var jumped = false;

var experimentValues = {alpha: 0.005, jumpPen: 0, idleRew: 3, successRew: 50, 
  diePen: -25};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function resetExperiment(){
  successfulJumpsSinceAvg = 0;
  trial = 0;
  trialsSinceLastAvg = 0;
  experimentNum += 1;
  jumped = false;

  experimentValues.alpha      = Math.random();
  experimentValues.jumpPen    = getRandomInt(-10,1);
  experimentValues.idleRew    = getRandomInt(0,5);
  experimentValues.successRew = getRandomInt(10,60);
  experimentValues.diePen     = getRandomInt(-30, -1);

  env = {};
  env.getNumStates = function() { return 4; }
  env.getMaxNumActions = function() { return 3; }

  spec =  {alpha: experimentValues.alpha, experience_size: 100, epsilon: 1.00, 
    num_hidden_units: 1000};
  agent = new RL.DQNAgent(env, spec);
}

/*
* Starts the Learning Loop
*/
setInterval(function(){
  if (!game.started) {
    game.playIntro();
    game.play();
  } else if (game.activated) {
    // Create the feature vector
    s = [game.currentSpeed, 93-game.tRex.yPos, 600, 0];
    if (game.horizon.obstacles.length > 0 && game.tRex.xPos < game.horizon.obstacles[0].xPos + game.horizon.obstacles[0].width){
      // If there is an obstacle, log it's distance.
      obst = game.horizon.obstacles[0];
      s[2] = obst.xPos - game.tRex.xPos;
      s[3] = obst.typeConfig.height;
    } else if (game.horizon.obstacles.length > 1 && game.tRex.xPos > game.horizon.obstacles[0].xPos){
      // There's more than one obstacle, and we've passed the first already
      console.log("Passed First");
      obst = game.horizon.obstacles[1];
      s[2] = obst.xPos - game.tRex.xPos;
      s[3] = obst.typeConfig.height;
    }

    var action = agent.act(s); // s is an array of length 5

    // Take the action chosen by the agent
    if(action == 0){
      player.do(Player.actions.IDLE);
      document.getElementById("action").innerHTML = "Idle";
      agent.learn(experimentValues.idleRew);
    } else if(action == 1){
      player.do(Player.actions.JUMP);
      document.getElementById("action").innerHTML = "Jump";
      agent.learn(experimentValues.jumpPen);
    } else if (action == 2) {
      player.do(Player.actions.DUCK);
      document.getElementById("action").innerHTML = "Duck";
    }

    // Decrement epsilon slowly
    if(agent.epsilon > 0.01){
      agent.epsilon = agent.epsilon - 0.0000025;
    }
    else{
      resetExperiment();
    }

  } else {
    // Punish for dying
    agent.learn(experimentValues.diePen);

    // Updates the google chart to display performance
    trial += 1;
    trialsSinceLastAvg += 1;
    if(trialsSinceLastAvg/50 == 1){
      avg = successfulJumpsSinceAvg / 50;
      updateChart([trial, avg]);
      var data = {experiment:experimentNum, trial:trial, avg:avg, 
        eps:agent.epsilon, alpha:experimentValues.alpha, 
        jumpPen:experimentValues.jumpPen, idleRew: experimentValues.idleRew,
        successRew:experimentValues.successRew, diePen:experimentValues.diePen};
      $.post("/saveData/", data, function(dat, status){
          console.log("data saved");
      });
      console.log("agent epsilon = " + String(agent.epsilon));
      successfulJumpsSinceAvg = 0;
      trialsSinceLastAvg = 0;
    }

    // var runs = document.getElementById("numRuns").innerHTML;
    // console.log(runs);
    document.getElementById("numRuns").innerHTML = trial;

    // Restart the game automatically
    game.restart();
  }

  // localStorage.setItem("agent", JSON.stringify(agent));
}, 150);

// Reward loop, rewards the agent when it is above/below an obstacle
setInterval(function(){
  if(typeof game.horizon.obstacles[0] != 'undefined'){
    if(game.tRex.xPos > game.horizon.obstacles[0].xPos + game.horizon.obstacles[0].width && jumped === false) {
      agent.learn(experimentValues.successRew);
      jumped = true;
      successfulJumpsSinceAvg += 1;
    } else if(game.tRex.xPos < game.horizon.obstacles[0].xPos + game.horizon.obstacles[0].width) {
      jumped = false;
    }
  }
}, 10);
