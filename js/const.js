'use strict';

const GAME_FIELD_ID = 'gameField';
const DELAY = 10;
const FOOD_DELAY = 1000;
const MAX_TTL = 50000;
const POPULATION_SIZE = 10;
const ELITISM = 5;
const MUTATION_RATE = 0.3;
const MUTATION_AMOUNT = 3;
const MAX_SEEKING_DISTANCE = 300;
const SECTORS_OF_VISION = 16;
const EDGE_DETECTION_DISTANCE = 40;
const EDGE_KILLING_DISTANCE = 0;

const FOUND_FOOD_SCORE = 10;
const CLOSE_TO_FOOD_SCORE = 1;
const DEATH_SCORE = 20;
const CLOSE_TO_EDGE_SCORE = 100;
