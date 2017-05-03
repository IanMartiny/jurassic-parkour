var game = window.dinoGame;
var player = new Player();

// create an environment object
var env = {};
env.getNumStates = function() { return 4; }
env.getMaxNumActions = function() { return 3; }

// create the DQN agent
var spec = { alpha: 0.005, experience_size: 100, epsilon: 0.20, num_hidden_units: 1000}
agent = new RL.DQNAgent(env, spec);

// Variables for graph
successfulJumpsSinceAvg = 0;
trialsSinceLastAvg = 0;
trial = 0;
jumped = false;

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
    } else if (game.horizon.obstacles.length > 1 && game.tRex.xPos > game.horizon.obstacles[0].xPos){
      // There's more than one obstacle, and we've passed the first already
      console.log("Passed First");
      obst = game.horizon.obstacles[1];
    }
    s[2] = obst.xPos - game.tRex.xPos;
    s[3] = obst.typeConfig.height;

    var action = agent.act(s); // s is an array of length 5

    // Take the action chosen by the agent
    if(action == 0){
      player.do(Player.actions.IDLE);
      document.getElementById("action").innerHTML = "Idle";
      agent.learn(3);
    } else if(action == 1){
      player.do(Player.actions.JUMP);
      document.getElementById("action").innerHTML = "Jump";
    } else if (action == 2) {
      player.do(Player.actions.DUCK);
      document.getElementById("action").innerHTML = "Duck";
    }

    // Decrement epsilon slowly
    if(agent.epsilon > 0.01){
      agent.epsilon = agent.epsilon - 0.0000025;
    }

  } else {
    // Punish for dying
    agent.learn(-25);

    // Updates the google chart to display performance
    trial += 1;
    trialsSinceLastAvg += 1;
    if(trialsSinceLastAvg/50 == 1){
      avg = successfulJumpsSinceAvg / 50;
      updateChart([trial, avg]);
      var data = {trial:trial, avg:avg, eps:agent.epsilon};
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

  localStorage.setItem("agent", JSON.stringify(agent));
}, 150);

// Reward loop, rewards the agent when it is above/below an obstacle
setInterval(function(){
  if(typeof game.horizon.obstacles[0] != 'undefined'){
    if(game.tRex.xPos > game.horizon.obstacles[0].xPos + game.horizon.obstacles[0].width && jumped === false) {
      agent.learn(50);
      jumped = true;
      successfulJumpsSinceAvg += 1;
    } else if(game.tRex.xPos < game.horizon.obstacles[0].xPos + game.horizon.obstacles[0].width) {
      jumped = false;
    }
  }
}, 10);