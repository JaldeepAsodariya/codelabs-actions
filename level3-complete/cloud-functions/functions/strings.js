// eslint-disable-next-line quotes
const deepFreeze = require('deep-freeze');

const general = {
    "unhandled": "Sorry, I didn't understand. What you want to know about this platform?",
    // Firebase database Root, Childs, Values
    "fireDatabase": {
        "rootName": "/platforms",
        "childChapters": "chapters"
    }
}

// Use deepFreeze to make the constant objects immutable so they are not unintentionally modified
module.exports = deepFreeze({
    general
});
