'use strict';

const {
    dialogflow,
    Permission,
    Suggestions,
} = require('actions-on-google');

const functions = require('firebase-functions');

const app = dialogflow({ debug: true });

app.intent('Default Welcome Intent', (conv) => {
    // Asks the user's permission to know their name, for personalization.
    conv.ask(new Permission({
        context: 'Hi there, to get to know you better',
        permissions: 'NAME',
    }));
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
    const welcomeResponse = `Hi!, Welcome to Google Developers Groups. What you want to know about this platform?`;
    if (!permissionGranted) {
        // If the user denied our request, go ahead with the conversation.
        conv.ask(`OK, no worries. ` + welcomeResponse);
        conv.ask(new Suggestions('About GDG Ahmedabad', 'Brief about'));
    } else {
        // If the user accepted our request, store their name in
        // the 'conv.data' object for the duration of the conversation.
        conv.data.userName = conv.user.name.display;
        conv.ask(`Thanks, ${conv.data.userName}. ` + welcomeResponse);
        conv.ask(new Suggestions('About GDG Ahmedabad', 'Brief about'));
    }
});

exports.dialogflowWebhook = functions.https.onRequest(app);