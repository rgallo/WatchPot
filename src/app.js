/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Vibe = require('ui/vibe');

var BUFFER_LENGTH = 2;

var $window = window;  // CloudPebble complains about window not existing, use $window to consolidate warnings.

var sampleData = [{
  name: 'Bold',
  description: 'Inverted Aeropress',
  grind: 'Medium Fine',
  coffeeAmount: 15,
  coffeeUnit: 'g',
  waterAmount: 200,
  waterUnit: 'g',
  timerSteps: [{
                    label: 'Pour',
                    len: 10,
                    buffer: false
                }, {
                    label: 'Stir',
                    len: 45,
                    buffer: false
                }, {
                    label: 'Flip',
                    len: 5,
                    buffer: false
                }, {
                    label: 'Plunge',
                    len: 20,
                    buffer: false
                }]
}, {
  name: 'Iced',
  description: 'Inverted Aeropress Over Ice',
  grind: 'Medium Fine',
  coffeeAmount: 17,
  coffeeUnit: 'g',
  waterAmount: 175,
  waterUnit: 'g',
  timerSteps: [{
                    label: 'Pour',
                    len: 10,
                    buffer: false
                },{
                    label: 'Stir',
                    len: 35,
                    buffer: false
                },{
                    label: 'Steep',
                    len: 60,
                    buffer: false
                },{
                    label: 'Flip',
                    len: 5,
                    buffer: false
                },{
                    label: 'Plunge',
                    len: 20,
                    buffer: false
                }]
}, {
  name: 'Wren',
  description: 'Traditional Aeropress For Two',
  grind: 'Medium Fine',
  coffeeAmount: 25,
  coffeeUnit: 'g',
  waterAmount: 200,
  waterUnit: 'g',
  timerSteps: [{
                    label: 'Pour',
                    len: 10,
                    buffer: false
                },{
                    label: 'Stir',
                    len: 15,
                    buffer: false
                },{
                    label: 'Steep',
                    len: 25,
                    buffer: false
                },{
                    label: 'Plunge',
                    len: 25,
                    buffer: false
                }]
}];

var mainMenuItems = [];
for (var i = 0; i < sampleData.length; i++) {
  mainMenuItems.push({
    title: sampleData[i].name,
    subtitle: sampleData[i].description
  });
}

var mainMenu = new UI.Menu({
  sections: [{
    title: 'WatchPot',
    items: mainMenuItems,
  }]
});

mainMenu.on('select', function(e) {
  showTimer(sampleData[e.itemIndex]);
});

mainMenu.show();

function showTimer(timer) {
  var timerCard = new UI.Card({
    title: timer.name,
    body: getTimerCardBody(timer),
    scrollable: true
  });
  timerCard.show();
  timerCard.on('click', 'select', function(e) {
    startTimer(timer);
  });
}

function getTimerCardBody(timer) {
  var body = [
    timer.description,
    'Grind: ' + timer.grind,
    'Coffee: ' + timer.coffeeAmount + ' ' + timer.coffeeUnit,
    'Water: ' + timer.waterAmount + ' ' + timer.waterUnit,
    'Center to Start'
  ];
  return body.join("\n");
}

function startTimer(timer) {
  var timeoutInterval = 200,
      timeoutIterations = 1000/timeoutInterval,
      timerSteps = timer.timerSteps;
    var timerWindow = new UI.Window();
    var timerLabel = new UI.Text({
    position: new Vector2(0, 10),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: '',
    textAlign: 'center'
  });
  timerWindow.add(timerLabel);
  var timerField = new UI.Text({
    position: new Vector2(0, 40),
    size: new Vector2(144, 108),
    font: 'roboto-bold-subset-49',
    text: "",
    textAlign: 'center'
  });
  timerWindow.add(timerField);
  var timerLabelBottom = new UI.Text({
    position: new Vector2(0, 108),
    size: new Vector2(144, 20),
    font: 'gothic-24-bold',
    text: '',
    textAlign: 'center'
  });
  timerWindow.add(timerLabelBottom);
  timerWindow.show();
  
  var currentStep = 0,
      timeLeft = 0,
      time = 0,
      isBuffer = false,
      isDone = false,
      timeoutCounter = 0;
  function startTimerStep(step, nextStepName, vibeLen) {
    timeLeft = step.len;
    timerField.text(step.len);
    if (step.label === 'Pour') {
      timerLabel.text(step.label + ' ' + timer.waterAmount + ' ' + timer.waterUnit);
    } else {
      timerLabel.text(step.label);
    }
    timerLabelBottom.text(nextStepName.length ? "Next: " + nextStepName : "");
    Vibe.vibrate(vibeLen);
  }
  function decrement() {
    time += timeoutInterval;
    if (++timeoutCounter >= timeoutIterations) {
      timeoutCounter = 0;
      timerField.text(--timeLeft);
      if (!timeLeft) {
        if (isDone) {
          timerWindow.hide();
        } else {
          var nextStepLabel = currentStep+2 < timerSteps.length ? timerSteps[currentStep+2].label : "";
          if (!isBuffer && timerSteps[currentStep].buffer) {
            isBuffer = true;
            startTimerStep({
              label: 'Buffer',
              len: BUFFER_LENGTH,
              buffer: false
            }, nextStepLabel, 'short');
          } else {
            isBuffer = false;
            if (++currentStep >= timerSteps.length) {
              isDone = true;
              startTimerStep({
                label: 'Done!',
                len: 10,
                buffer: false
              }, nextStepLabel, 'double');
            } else {
              startTimerStep(timerSteps[currentStep], nextStepLabel, 'short');
            }
          }
        }
      }
    }
    if (!isDone || timeLeft) {
      var timeDiff = (new Date().getTime() - startTime) - time;
      console.log(timeDiff);
      $window.setTimeout(decrement, timeoutInterval-timeDiff);
    }
  }
  startTimerStep(timerSteps[currentStep], currentStep+1 < timerSteps.length ? timerSteps[currentStep+1].label : "", 'short');
  // http://www.sitepoint.com/creating-accurate-timers-in-javascript/
  var startTime = new Date().getTime();
  $window.setTimeout(decrement, timeoutInterval);
}