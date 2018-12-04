'use strict';

function generateId()
{
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/**
 * Returns random emoji char like rat or mouse
 * @returns {string}
 */
function getEmojiForCreature() {
    const emoji = [
        '\u{1F400}',
        '\u{1F407}',
        '\u{1F43F}',
        '\u{1F413}',
        '\u{1F427}',
        '\u{1F986}',
        '\u{1F989}',
        '\u{1F986}',
        '\u{1F41E}',
        '\u{1F577}',
        '\u{1F980}',
        '\u{1F980}',
        '\u{1F990}',
        '\u{1F991}',
        '\u{1F41C}',
    ];

    return emoji[Math.round(Math.random() * (emoji.length - 1))];
}

/**
 * Returns food emoji
 * @returns {string}
 */
function getEmojiForFood() {
    const emoji = [
        '\u{1F966}',
        '\u{1F344}',
        '\u{1F955}',
        '\u{1F353}',
        '\u{1F352}',
        '\u{1F350}',
        '\u{1F34F}',
        '\u{1F34E}',
        '\u{1F34D}',
        '\u{1F34C}',
        '\u{1F349}',
        '\u{1F347}',
    ];

    return emoji[Math.round(Math.random() * (emoji.length - 1))];
}
