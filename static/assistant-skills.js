"use strict";

window.RevortanaSkills = {
  run: function (text) {
    if (/\b(flip a coin|toss a coin)\b/.test(text)) {
      return Math.random() < 0.5 ? "It’s heads!" : "It’s tails!";
    }
    if (/\b(roll a die|roll dice|roll a dice)\b/.test(text)) {
      return "You rolled a " + (Math.floor(Math.random() * 6) + 1) + ".";
    }

    var numberRequest = text.match(/\b(?:pick|choose|give me) a number between (\d+) and (\d+)\b/);
    if (numberRequest) {
      var first = parseInt(numberRequest[1], 10);
      var second = parseInt(numberRequest[2], 10);
      if (!isFinite(first) || !isFinite(second) || Math.abs(first - second) > 1000000) {
        return "Choose whole numbers no more than one million apart, and I’ll pick between them.";
      }
      var lower = Math.min(first, second);
      var upper = Math.max(first, second);
      return "How about " + (Math.floor(Math.random() * (upper - lower + 1)) + lower) + "?";
    }

    if (/\b(tell me a riddle|give me a riddle)\b/.test(text)) {
      return "What has a face and two hands but no arms or legs? A clock.";
    }
    if (/\bwrite me a haiku\b|\bmake a haiku\b/.test(text)) {
      return "Blue lights softly glow / A kind blue voice crosses the night / Stars wake with the dawn";
    }

    return null;
  },
};
