"use strict";

const form = document.querySelector("#ask-form");
const question = document.querySelector("#question");
const reply = document.querySelector("#reply-text");
const today = document.querySelector("#today");

function getReply(message) {
  const text = message.toLowerCase().replace(/[?!.,]/g, "").trim();

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
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text)) {
    return "Hey there! It’s lovely to hear from you.";
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
  if (/\b(are you there|anyone there|can you hear me)\b/.test(text)) {
    return "Right here, listening. It’s nice to have a little company, isn’t it?";
  }
  if (/\bthank(s| you)\b/.test(text)) {
    return "You’re very welcome. Always happy to help.";
  }
  if (/\b(what time is it|current time)\b/.test(text)) {
    return `It’s ${new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date())} on your device.`;
  }
  if (/\b(what day is it|what is the date|today's date)\b/.test(text)) {
    return `It’s ${new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date())}.`;
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
    return "I can tell you the time or date, answer a few capital-city questions, share a joke, or keep you company. Ask me the capital of France for a little Verity-style reply.";
  }

  return null;
}

if (today) {
  today.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date()).toUpperCase();
}

if (form && question && reply) {
  const submitButton = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = question.value.trim();

    if (!message) {
      reply.textContent = "I'm right here whenever you're ready.";
      question.focus();
      return;
    }

    const localReply = getReply(message);
    question.value = "";
    if (localReply) {
      reply.textContent = localReply;
      return;
    }

    reply.textContent = "Let me think about that…";
    if (submitButton) {
      submitButton.disabled = true;
    }
    question.disabled = true;
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "I couldn’t answer just now. Please try again.");
      }
      if (typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error("I got an empty answer. Please try again.");
      }
      reply.textContent = result.reply;
    } catch (error) {
      reply.textContent =
        error instanceof Error
          ? error.message
          : "I couldn’t answer just now. Please try again.";
    } finally {
      question.disabled = false;
      if (submitButton) {
        submitButton.disabled = false;
      }
      question.focus();
    }
  });
}
