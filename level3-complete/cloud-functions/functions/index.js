'use strict';

const {
    dialogflow,
    Permission,
    BasicCard,
    Suggestions,
    Button,
    Image,
} = require('actions-on-google');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const strings = require('./strings') // Import strings.js for use constants value

const app = dialogflow({ debug: true });

// Firebase Realtime database reference
const platformsRef = admin.database().ref(strings.general.fireDatabase.rootName);

var isChapterMatched = false;

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

// Handle the Dialogflow intent named 'brief_platform'.
app.intent('brief_platform', (conv) => {

    return platformsRef.once('value', snapshot => {

        snapshot.forEach(function (childSnapshot) {

            conv.ask(childSnapshot.val().brief);
            conv.ask(new Suggestions('GDG Ahmedabad', 'GDG Baroda'));
        });
    });
});

// Handle the Dialogflow intent named 'brief_chapter'.
// Get the chapter details from Firebase Realtime Database
app.intent('brief_chapter', (conv, { chapterName }) => {

    return platformsRef.once('value', snapshot => {

        snapshot.forEach(function (childSnapshot) {

            var chaptersSnapshot = childSnapshot.child(strings.general.fireDatabase.childChapters);

            chaptersSnapshot.forEach(function (childSnapshot) {

                if (chapterName === childSnapshot.val().referenceValue) { // Chapter name Matched

                    console.log('Chapter name Matched');
                    isChapterMatched = true;

                    // Check if current device has screen output and generate response accordingly
                    if (!conv.screen) {

                        conv.ask(childSnapshot.val().aboutBrief);
                    } else {

                        // Generate starting response with Username, if available in conv.data object
                        var startingResponse;
                        if (conv.data.userName) {
                            startingResponse = `Hey, ${conv.data.userName}. Here's the chapter`;
                        } else {
                            startingResponse = `Here's the chapter`;
                        }

                        // Generate Rich response with BasicCard including Title, Text, Button and Image
                        conv.ask(startingResponse, new BasicCard({
                            title: childSnapshot.val().name,
                            text: childSnapshot.val().aboutBrief,
                            buttons: new Button({
                                title: 'Join community',
                                url: childSnapshot.val().url,
                            }),
                            image: new Image({
                                url: childSnapshot.val().image.url,
                                alt: childSnapshot.val().image.altText,
                            }),
                        }));
                        conv.ask(new Suggestions('About platform', 'About chapter', 'Bye'));
                    }
                    return conv; // return for STOP the loop.
                } else { // Chapter name NOT Matched

                    console.log('Chapter name NOT Matched');
                    isChapterMatched = false;
                }
            });
        });

        // If chapterName is NOT matched, prompt simple response with suggestions other chapters.
        if (!isChapterMatched) {

            conv.ask(`Oops! we don't have any information about this chapter.`);
            conv.ask(new Suggestions('GDG Ahmedabad', 'GDG Rajkot'));
            return conv;
        }
    });
});

exports.dialogflowWebhook = functions.https.onRequest(app);