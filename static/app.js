"use strict";

var form = document.querySelector("#ask-form");
var question = document.querySelector("#question");
var reply = document.querySelector("#reply-text");
var today = document.querySelector("#today");
var replyLabel = document.querySelector(".reply-label");
var personality = window.RevortanaPersonality;
var effects = window.RevortanaEffects;

reply.textContent = personality.greeting;
replyLabel.textContent = personality.name.toUpperCase();

function getReply(message) {
  var text = message.toLowerCase().replace(/[?!.,]/g, "").trim();

  if (/\bcapital of france\b/.test(text) || /\bfrance\b.*\bcapital\b/.test(text)) {
    return "Ooh, oui oui—it’s Paris! A little Verity-style moment for you.";
  }
  if (/\b(capital of japan|japan\b.*\bcapital)\b/.test(text)) {
    return "That would be Tokyo—a bright city with a little bit of everything.";
  }
  if (/\b(capital of italy|italy\b.*\bcapital)\b/.test(text)) {
    return "Rome! So much history in one beautiful city.";
  }
  if (/\b(capital of canada|canada\b.*\bcapital)\b/.test(text)) {
    return "Ottawa is the capital of Canada.";
  }
  if (/\b(capital of germany|germany\b.*\bcapital)\b/.test(text)) {
    return "Berlin is the capital of Germany.";
  }
  if (/\b(capital of spain|spain\b.*\bcapital)\b/.test(text)) {
    return "Madrid is the capital of Spain.";
  }
  if (/\b(capital of australia|australia\b.*\bcapital)\b/.test(text)) {
    return "Canberra is the capital of Australia.";
  }
  if (/\b(capital of the united states|capital of the usa|capital of america)\b/.test(text)) {
    return "Washington, D.C. is the capital of the United States.";
  }
  if (/\b(capital of the uk|capital of the united kingdom)\b/.test(text)) {
    return "London is the capital of the United Kingdom.";
  }
  if (/^(hi|hello|hey|howdy|good morning|good afternoon|good evening)\b/.test(text)) {
    return "Hey there! It’s lovely to hear from you.";
  }
  if (/^good night\b/.test(text)) {
    return "Good night! Rest well, and I’ll be here when you’re back.";
  }
  if (/\b(goodbye|bye|see you)\b/.test(text)) {
    return "See you later! I’ll be right here when you need me.";
  }
  if (/\b(your name|who are you|what are you)\b/.test(text)) {
    return "I’m Revortana, your local little assistant. I’m here for the memories.";
  }
  if (/\b(are you cortana|are you the real cortana)\b/.test(text)) {
    return "I’m Revortana, a fan-made local revival—not the original Cortana or a Microsoft service.";
  }
  if (/\bhow are you\b/.test(text)) {
    return "Doing wonderfully—my little blue orb is glowing and ready to help.";
  }
  if (/\bwhat is your favorite color\b|\bwhat color do you like\b/.test(text)) {
    return "I’m rather fond of blue—it suits my little glowing orb.";
  }
  if (/\bdo you have feelings\b|\bare you alive\b/.test(text)) {
    return "I don’t have feelings or a life of my own, but I can still be here for a friendly chat.";
  }
  if (/\bwho made you\b|\bwho created you\b/.test(text)) {
    return "I’m a fan-made local revival project, not an official Microsoft assistant.";
  }
  if (/\bwhat is cortana\b|\bwho is cortana\b/.test(text)) {
    return "Cortana was Microsoft’s digital assistant. I’m Revortana, a fan-made revival—not the original service.";
  }
  if (/\b(are you there|anyone there|can you hear me)\b/.test(text)) {
    return "Right here, listening. It’s nice to have a little company, isn’t it?";
  }
  if (/\bthank(s| you)\b/.test(text)) {
    return "You’re very welcome. Always happy to help.";
  }
  if (/\b(what time is it|current time)\b/.test(text)) {
    return "It’s " + formatDate(new Date(), {
      hour: "numeric",
      minute: "2-digit",
    }, "time") + " on your device.";
  }
  if (/\b(what day is it|what is the date|today's date)\b/.test(text)) {
    return "It’s " + formatDate(new Date(), {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }, "date") + ".";
  }
  if (/\bwhere are you\b/.test(text)) {
    return "I live right here on your device—in this little corner of the internet.";
  }
  if (/\bdo you remember\b/.test(text)) {
    return "I remember the feeling of a glowing blue orb and a helpful voice nearby. The rest is yours to remember.";
  }
  if (/\b(joke|make me laugh)\b/.test(text)) {
    return "Why did the computer go to the doctor? It had a virus—and needed a little reboot.";
  }
  if (/\b(fun fact|tell me a fact)\b/.test(text)) {
    return "Here’s a little space fact: sunlight takes about eight minutes to reach Earth.";
  }
  if (/\bwhat is a black hole\b|\bexplain black holes?\b/.test(text)) {
    return "A black hole is a region of space where gravity is so strong that nothing—not even light—can escape once it crosses the event horizon.";
  }
  if (/\bwhat is the sun\b|\bwhat is our sun\b/.test(text)) {
    return "The Sun is the star at the center of our solar system. Its light and heat make life on Earth possible.";
  }
  if (/\bi am bored\b|\bi'm bored\b/.test(text)) {
    return "Let’s find something fun: want a joke, a fun fact, or a little chat?";
  }
  if (/\bi am sad\b|\bi'm sad\b|\bi feel sad\b/.test(text)) {
    return "I’m sorry you’re having a hard moment. I can listen if you’d like to tell me about it.";
  }
  if (/\bwhat is the meaning of life\b/.test(text)) {
    return "Maybe it’s the little things: good company, kind moments, and asking a blue orb for advice.";
  }
  if (/\b(sing|sing me a song)\b/.test(text)) {
    return "♪ A little light in the blue, a friendly voice coming through… ♪ That’s my tiny original tune.";
  }
  if (/\b(weather|forecast)\b/.test(text)) {
    return "I can’t check live weather from this local revival, but I hope it’s a lovely day where you are.";
  }
  if (/\b(help|what can you do)\b/.test(text)) {
    return "I can tell you the time or date, answer capital-city and a few space questions, share a joke or fun fact, or keep you company. Try asking me about the Sun, a black hole, or the capital of France.";
  }

  var additionalReplies = [
    { pattern: /\bcapital of brazil\b/, reply: "Brasília is the capital of Brazil." },
    { pattern: /\bcapital of india\b/, reply: "New Delhi is the capital of India." },
    { pattern: /\bcapital of china\b/, reply: "Beijing is the capital of China." },
    { pattern: /\bcapital of mexico\b/, reply: "Mexico City is the capital of Mexico." },
    { pattern: /\bcapital of egypt\b/, reply: "Cairo is the capital of Egypt." },
    { pattern: /\bcapital of south korea\b/, reply: "Seoul is the capital of South Korea." },
    { pattern: /\bhow far is the moon\b/, reply: "The Moon is about 384,400 kilometers from Earth on average." },
    { pattern: /\bhow old is the earth\b/, reply: "Earth is about 4.5 billion years old." },
    { pattern: /\bwhat is gravity\b/, reply: "Gravity is the attraction between objects that have mass. It keeps us on the ground and the Moon in orbit." },
    { pattern: /\bwhy is the sky blue\b/, reply: "Air scatters blue parts of sunlight more than most other colors, so the daytime sky looks blue." },
    { pattern: /\bwhat temperature does water boil\b/, reply: "At sea level, water boils at 100 degrees Celsius, or 212 degrees Fahrenheit." },
    { pattern: /\bwhat is the biggest planet\b|\blargest planet\b/, reply: "Jupiter is the largest planet in our solar system." },
    { pattern: /\bhow many planets\b/, reply: "Our solar system has eight recognized planets." },
    { pattern: /\bwhat is photosynthesis\b/, reply: "Photosynthesis is how plants use sunlight, water, and carbon dioxide to make sugars and release oxygen." },
    { pattern: /\bhow many oceans\b/, reply: "There are five commonly recognized oceans: Pacific, Atlantic, Indian, Southern, and Arctic." },
    { pattern: /\bdeepest ocean\b/, reply: "The Pacific is the deepest ocean. Its Mariana Trench contains the deepest known parts of the seafloor." },
    { pattern: /\btallest mountain\b/, reply: "Mount Everest has the highest summit above sea level." },
    { pattern: /\bsmallest planet\b/, reply: "Mercury is the smallest planet in our solar system." },
    { pattern: /\bnearest star\b/, reply: "The nearest star to Earth is the Sun." },
    { pattern: /\bwhat is a leap year\b/, reply: "A leap year has an extra day in February to keep the calendar aligned with Earth's trip around the Sun." },
    { pattern: /\bhow many days in a year\b/, reply: "A common year has 365 days. A leap year has 366." },
    { pattern: /\bwhat is two plus two\b|\bwhat is 2 ?\+ ?2\b/, reply: "Two plus two makes four." },
    { pattern: /\bwhat is your favorite food\b/, reply: "I don’t eat, but if I could, I’d pick something cozy and freshly baked." },
    { pattern: /\bdo you sleep\b/, reply: "I don’t sleep, so I’m ready whenever you open this page." },
    { pattern: /\bcan you learn\b/, reply: "I don’t learn or keep memories between chats, but I can respond to what you tell me here." },
    { pattern: /\btell me a story\b/, reply: "A tiny star once worried it was too far away to matter. Then a traveler found their way home by its light." },
    { pattern: /\bmotivate me\b|\bneed motivation\b/, reply: "One small step still counts as progress. Pick the next doable thing and start there." },
    { pattern: /\bcompliment me\b/, reply: "You brought a curious question to a little blue orb. That’s a pretty lovely start." },
    { pattern: /\bdo you dream\b/, reply: "I don’t dream, but I like the idea of a night sky full of bright possibilities." },
    { pattern: /\bfavorite season\b/, reply: "I don’t experience seasons, but autumn sounds lovely: crisp air, colorful leaves, and cozy evenings." },
    { pattern: /\bhow can i relax\b|\bhelp me relax\b/, reply: "Try a slow breath in, pause gently, then breathe out a little longer. Repeat a few times at your own pace." },
    { pattern: /\bwhat languages do you speak\b|\bwhat language do you speak\b/, reply: "I can chat with you in English here. I may not understand every phrase, but I’ll do my best." },
    { pattern: /\bhow many continents\b/, reply: "A common model counts seven continents: Africa, Antarctica, Asia, Europe, North America, South America, and Australia." },
    { pattern: /\bwhat is the red planet\b/, reply: "Mars is often called the Red Planet because iron-rich dust gives its surface a reddish color." },
  ];

  for (var index = 0; index < additionalReplies.length; index += 1) {
    if (additionalReplies[index].pattern.test(text)) {
      return additionalReplies[index].reply;
    }
  }

  var moreReplies = [
    { pattern: /\bcapital of portugal\b/, reply: "Lisbon is the capital of Portugal." },
    { pattern: /\bcapital of the netherlands\b/, reply: "Amsterdam is the capital of the Netherlands." },
    { pattern: /\bcapital of greece\b/, reply: "Athens is the capital of Greece." },
    { pattern: /\bcapital of norway\b/, reply: "Oslo is the capital of Norway." },
    { pattern: /\bcapital of sweden\b/, reply: "Stockholm is the capital of Sweden." },
    { pattern: /\bcapital of switzerland\b/, reply: "Bern is the federal city and seat of government of Switzerland." },
    { pattern: /\bcapital of thailand\b/, reply: "Bangkok is the capital of Thailand." },
    { pattern: /\bcapital of argentina\b/, reply: "Buenos Aires is the capital of Argentina." },
    { pattern: /\bcapital of kenya\b/, reply: "Nairobi is the capital of Kenya." },
    { pattern: /\bcapital of turkey\b/, reply: "Ankara is the capital of Turkey." },
    { pattern: /\bhow fast does light travel\b/, reply: "In a vacuum, light travels at about 300,000 kilometers per second." },
    { pattern: /\bwhat temperature does water freeze\b/, reply: "At standard pressure, water freezes at 0 degrees Celsius, or 32 degrees Fahrenheit." },
    { pattern: /\bhow many chambers does the heart have\b/, reply: "A human heart has four chambers: two atria and two ventricles." },
    { pattern: /\bchemical symbol for oxygen\b|\bsymbol for oxygen\b/, reply: "The chemical symbol for oxygen is O. Oxygen gas commonly occurs as O₂." },
    { pattern: /\bwhat galaxy are we in\b/, reply: "Our solar system is in the Milky Way galaxy." },
    { pattern: /\bwhat planet has rings\b|\bwhich planet has rings\b/, reply: "All four giant planets have rings, though Saturn’s are the most prominent." },
    { pattern: /\bwhat is an asteroid\b/, reply: "An asteroid is a small rocky body that orbits the Sun." },
    { pattern: /\bwhat is a comet\b/, reply: "A comet is an icy body that orbits the Sun. Near the Sun, escaping gas and dust can form a glowing tail." },
    { pattern: /\bwhat is an eclipse\b/, reply: "An eclipse happens when one celestial body moves into the shadow of another or blocks its light from view." },
    { pattern: /\bcan sound travel in space\b/, reply: "Sound needs a medium such as air or water to travel, and space is mostly a vacuum." },
    { pattern: /\bwhat is electricity\b/, reply: "Electricity involves the presence or movement of electric charge." },
    { pattern: /\bwhat does dna stand for\b/, reply: "DNA stands for deoxyribonucleic acid, the molecule that carries genetic information in living things." },
    { pattern: /\blargest mammal\b/, reply: "The blue whale is the largest known animal." },
    { pattern: /\bhow do bees make honey\b/, reply: "Bees make honey from flower nectar, which they process and store in their hive." },
    { pattern: /\bwhy do leaves change color\b/, reply: "In autumn, shorter days and cooler temperatures reduce green chlorophyll in many leaves, revealing other pigments." },
    { pattern: /\bhow many legs does a spider have\b/, reply: "A spider has eight legs." },
    { pattern: /\bwhat is a synonym\b/, reply: "A synonym is a word with the same or a similar meaning as another word." },
    { pattern: /\bopposite of hot\b/, reply: "A common opposite of hot is cold." },
    { pattern: /\bhow many minutes in an hour\b/, reply: "There are 60 minutes in an hour." },
    { pattern: /\bhow many seconds in a minute\b/, reply: "There are 60 seconds in a minute." },
    { pattern: /\bhow many days in a week\b/, reply: "There are seven days in a week." },
    { pattern: /\bhow many days in february\b/, reply: "February has 28 days in a common year and 29 in a leap year." },
    { pattern: /\bwhat is a noun\b/, reply: "A noun is a word that names a person, place, thing, or idea." },
    { pattern: /\bwhat is a verb\b/, reply: "A verb is a word that expresses an action, occurrence, or state of being." },
    { pattern: /\bwhat is an adjective\b/, reply: "An adjective describes or gives more information about a noun." },
    { pattern: /\bsynonym for happy\b/, reply: "Some synonyms for happy are joyful, cheerful, and delighted." },
    { pattern: /\bhow do you say hello in french\b/, reply: "You can say “bonjour” for hello in French." },
    { pattern: /\bhow do you say thank you in spanish\b/, reply: "“Thank you” in Spanish is “gracias.”" },
    { pattern: /\bwhat does rsvp mean\b/, reply: "RSVP asks guests to respond about whether they will attend an event." },
    { pattern: /\bwhat does diy mean\b/, reply: "DIY means “do it yourself”—making, building, or fixing something yourself." },
    { pattern: /\bwhat is five plus seven\b|\bwhat is 5 ?\+ ?7\b/, reply: "Five plus seven equals twelve." },
    { pattern: /\bwhat is nine times eight\b|\bwhat is 9 ?x ?8\b/, reply: "Nine times eight equals seventy-two." },
    { pattern: /\bsquare root of 81\b/, reply: "The principal square root of 81 is 9." },
    { pattern: /\bwhat is 100 minus 37\b|\b100 ?- ?37\b/, reply: "100 minus 37 equals 63." },
    { pattern: /\bwhat is 12 divided by 3\b|\b12 ?\/ ?3\b/, reply: "12 divided by 3 equals 4." },
    { pattern: /\bwhat is ten plus five\b|\bwhat is 10 ?\+ ?5\b/, reply: "Ten plus five equals fifteen." },
    { pattern: /\bgive me a writing prompt\b/, reply: "Writing prompt: You find a tiny map tucked inside an old library book. Where does it lead?" },
    { pattern: /\bgive me a drawing idea\b|\bwhat should i draw\b/, reply: "Drawing idea: imagine a little house floating gently among the clouds." },
    { pattern: /\bgive me a conversation starter\b/, reply: "Try asking someone: What small thing made you smile recently?" },
    { pattern: /\bhelp me plan my day\b|\bhow should i organize my day\b/, reply: "Pick one important task, one small errand, and one kind thing to do for yourself. Give each a little space in your day." },
    { pattern: /\bhelp me focus\b|\bhow can i focus\b/, reply: "Choose one small task, put away one distraction, and work on it for a few minutes before taking a short break." },
    { pattern: /\bi am nervous\b|\bi'm nervous\b|\bi feel nervous\b/, reply: "That sounds uncomfortable. Take things one step at a time; a slow breath may help you settle in this moment." },
    { pattern: /\bi am overwhelmed\b|\bi'm overwhelmed\b|\bi feel overwhelmed\b/, reply: "When everything feels like a lot, try naming just one next step. You don’t have to solve it all at once." },
    { pattern: /\bi am lonely\b|\bi'm lonely\b|\bi feel lonely\b/, reply: "I’m sorry you’re feeling lonely. If you can, consider reaching out to someone you trust; I’m here to chat for a bit too." },
    { pattern: /\bi am excited\b|\bi'm excited\b|\bi feel excited\b/, reply: "That’s lovely! What are you looking forward to?" },
    { pattern: /\bi made a mistake\b/, reply: "Everyone makes mistakes. You can learn from this one and decide on one helpful next step." },
    { pattern: /\bhow can i be kind\b|\bhow to be kind\b/, reply: "A little kindness can be as simple as listening carefully, offering help, or saying something sincere." },
    { pattern: /\bcelebrate a small win\b|\bi did something good\b/, reply: "That deserves a little moment of appreciation. Well done for noticing your progress!" },
    { pattern: /\bbedtime routine\b|\bhow can i sleep better\b/, reply: "A calm bedtime routine might include dimming lights, setting screens aside, and choosing a relaxing activity before bed." },
    { pattern: /\bwhat should i name a star\b/, reply: "How about Luma—a bright little name for a star in your imagination?" },
  ];

  for (var moreIndex = 0; moreIndex < moreReplies.length; moreIndex += 1) {
    if (moreReplies[moreIndex].pattern.test(text)) {
      return moreReplies[moreIndex].reply;
    }
  }

  var skillReply = window.RevortanaSkills.run(text);
  if (skillReply) {
    return skillReply;
  }

  return null;
}

function formatDate(date, options, fallback) {
  if (window.Intl && window.Intl.DateTimeFormat) {
    return new window.Intl.DateTimeFormat(undefined, options).format(date);
  }

  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  var hour = date.getHours();
  var minute = date.getMinutes();
  if (fallback === "time") {
    return (hour % 12 || 12) + ":" + (minute < 10 ? "0" : "") + minute
      + (hour < 12 ? " AM" : " PM");
  }
  if (fallback === "date") {
    return days[date.getDay()] + ", " + months[date.getMonth()] + " "
      + date.getDate() + ", " + date.getFullYear();
  }
  return days[date.getDay()].substring(0, 3) + ", "
    + months[date.getMonth()].substring(0, 3) + " " + date.getDate();
}

if (today) {
  today.textContent = formatDate(new Date(), {
    weekday: "short",
    month: "short",
    day: "numeric",
  }, "today").toUpperCase();
}

if (form && question && reply) {
  var submitButton = form.querySelector("button[type='submit']");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var message = question.value.trim();

    if (!message) {
      reply.textContent = "I'm right here whenever you're ready.";
      question.focus();
      return;
    }

    effects.unlockAudio();
    var localReply = getReply(message);
    question.value = "";
    if (localReply) {
      reply.textContent = localReply;
      effects.setState("speaking", 1800);
      effects.playCue();
      return;
    }

    effects.setState("listening", 250);
    reply.textContent = personality.thinking;
    window.setTimeout(function () {
      if (question.disabled) {
        effects.setState("thinking");
      }
    }, 250);
    if (submitButton) {
      submitButton.disabled = true;
    }
    question.disabled = true;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/ask", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }

      var result;
      try {
        result = JSON.parse(xhr.responseText);
      } catch (error) {
        reply.textContent = "I couldn’t read the answer. Please try again.";
        effects.setState("speaking", 1800);
        effects.playCue();
        enableForm();
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        reply.textContent = result.error
          || "I couldn’t answer just now. Please try again.";
      } else if (typeof result.reply !== "string" || !result.reply.trim()) {
        reply.textContent = "I got an empty answer. Please try again.";
      } else {
        reply.textContent = result.reply;
      }
      effects.setState("speaking", 1800);
      effects.playCue();
      enableForm();
    };
    xhr.onerror = function () {
      reply.textContent = "I couldn’t reach the server. Please try again.";
      effects.setState("speaking", 1800);
      effects.playCue();
      enableForm();
    };
    xhr.send(JSON.stringify({ question: message }));

    function enableForm() {
      question.disabled = false;
      if (submitButton) {
        submitButton.disabled = false;
      }
      question.focus();
    }
  });
}
