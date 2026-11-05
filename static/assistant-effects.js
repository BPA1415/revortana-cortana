"use strict";

(function () {
  var welcome = document.querySelector(".welcome");
  var status = document.querySelector("#assistant-status");
  var soundToggle = document.querySelector("#sound-toggle");
  var AudioConstructor = window.AudioContext || window.webkitAudioContext;
  var audioContext = null;
  var soundEnabled = true;
  var stateTimeout = null;

  if (!AudioConstructor) {
    soundToggle.style.display = "none";
  }

  function setState(state, duration) {
    welcome.className = welcome.className
      .replace(/\bis-(idle|listening|thinking|speaking)\b/g, "")
      .replace(/^\s+|\s+$/g, "");
    welcome.className += " is-" + state;
    status.textContent = {
      idle: "READY TO LISTEN",
      listening: "LISTENING",
      thinking: "THINKING",
      speaking: "HERE TO HELP",
    }[state] || "READY TO LISTEN";

    if (stateTimeout) {
      window.clearTimeout(stateTimeout);
      stateTimeout = null;
    }
    if (duration) {
      stateTimeout = window.setTimeout(function () {
        setState("idle");
      }, duration);
    }
  }

  function playCue() {
    if (!soundEnabled || !AudioConstructor) {
      return;
    }
    if (!audioContext) {
      audioContext = new AudioConstructor();
    }

    var startTime = audioContext.currentTime;
    var notes = [660, 880];
    for (var index = 0; index < notes.length; index += 1) {
      var oscillator = audioContext.createOscillator();
      var gain = audioContext.createGain();
      var noteStart = startTime + index * 0.12;
      oscillator.type = "sine";
      oscillator.frequency.value = notes[index];
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.035, noteStart + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.16);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.17);
    }
  }

  function unlockAudio() {
    if (!soundEnabled || !AudioConstructor) {
      return;
    }
    if (!audioContext) {
      audioContext = new AudioConstructor();
    }
    if (audioContext.state === "suspended" && audioContext.resume) {
      audioContext.resume();
    }
  }

  soundToggle.addEventListener("click", function () {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
    soundToggle.textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
    if (soundEnabled) {
      playCue();
    }
  });

  window.RevortanaEffects = {
    unlockAudio: unlockAudio,
    playCue: playCue,
    setState: setState,
  };
}());
