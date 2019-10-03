'use strict';

function Creature(x, y, brain) {
    MovingObject.call(this, x, y); // parent constructor
    this.ttl = MAX_TTL - Math.random() * MAX_TTL / 2;
    this.size = convertTtlToSize(this.ttl);
    this.sign = getEmojiForCreature();
    this.needDelete = false;
    this.step = 1;
    this.brain = brain;
}

Creature.prototype = Object.create(MovingObject.prototype, {
    SIZE: {
        value: 20,
        enumerable: true,
        configurable: true,
        writable: false
    },
    doTurn: {
        value: function(maxX, maxY, food){

            //life pass
            this.ttl -= DELAY;

            //steps
            let distanceToFoodBefore = getVisibleFood(this.x, this.y, food, MAX_SEEKING_DISTANCE);
            const edgeDetectionResults = edgeDetection(this.x, this.y, maxX, maxY, EDGE_DETECTION_DISTANCE);
            const activationResult = this.brain.activate([...distanceToFoodBefore, ...edgeDetectionResults]);

            this.direction = activationResult[0] > 1 ? 1 : activationResult[0] < 0 ? 0 : activationResult[0];
            this.direction = this.direction * 2 * Math.PI;
            this.speed = activationResult[1] > 1 ? 1 : activationResult[1] < 0 ? 0 : activationResult[1];

            MovingObject.prototype.doTurn.apply(this, arguments); // call super

            // moving to food reward
            let distanceToFoodAfter = getVisibleFood(this.x, this.y, food, MAX_SEEKING_DISTANCE);
            distanceToFoodAfter = distanceToFoodAfter.filter((e) => e > 0); // delete zeroes
            distanceToFoodBefore = distanceToFoodBefore.filter((e) => e > 0); // delete zeroes
            if (distanceToFoodBefore.length > 0 && distanceToFoodAfter.length > 0) {
                const minDistanceAfter = Math.min(...distanceToFoodAfter);
                const minDistanceBefore = Math.min(...distanceToFoodBefore);
                if (minDistanceAfter < minDistanceBefore) {
                    this.brain.score += CLOSE_TO_FOOD_SCORE;
                } else if(minDistanceAfter > minDistanceBefore) {
                    this.brain.score -= CLOSE_TO_FOOD_SCORE;
                }
            }

            // punish close to edge moving
            const edgeKillingResults = edgeDetection(this.x, this.y, maxX, maxY, EDGE_KILLING_DISTANCE);
            if (edgeKillingResults.some((e) => e === 1)) {
                this.needDelete = true;
                this.brain.score -= CLOSE_TO_EDGE_SCORE;
            }

            if (this.ttl < 0) {
                this.needDelete = true;
                this.brain.score -= DEATH_SCORE; // punish death
            }

            if (!this.needDelete) {
                this.redraw();
            }
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
    createDOMElement: {
        value: function() {
            const element = document.createElement('div');
            const gameField = document.getElementById(GAME_FIELD_ID);
            element.setAttribute('id', this.id);
            element.innerHTML = this.sign;
            element.setAttribute('class', 'creature');
            gameField.appendChild(element);
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
    checkIntersect: {
        value: function(foodStore) {
            for (let i = 0; i < foodStore.length; i++) {
                const food = foodStore[i];
                if ((Math.abs(food.x - this.x) < (food.size + this.size) / 2)
                    && (Math.abs(food.y - this.y) < (food.size + this.size) / 2)) {
                    foodStore[i].needDelete = true;
                    this.ttl += 10000; // TODO: const?
                    this.brain.score += FOUND_FOOD_SCORE;
                }
            }
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
    redraw: {
        value: function() {
            MovingObject.prototype.redraw.apply(this, arguments);
            const element = document.getElementById(this.id);

            element.style.height = convertTtlToSize(this.ttl) + 'px';
            element.style.width = convertTtlToSize(this.ttl) + 'px';
            element.style.fontSize = convertTtlToFontSize(this.ttl) + 'px';
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
});

Creature.prototype.constructor = Creature;

/**
 * Converts ttl to screen siz
 *
 * @param {number} ttl
 * @returns {number}
 */
function convertTtlToSize(ttl) {
    const result = Creature.prototype.SIZE * (ttl / MAX_TTL);
    return result < 10 ? 10 : result;
}

function convertTtlToFontSize(ttl) {
    const result =  18 * (ttl / MAX_TTL);
    return result < 10 ? 10 : result;
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {[]} food
 * @param {number} seekingDistance
 * @return {array} [0, 0, 20, 0 ... ]
 */
function getVisibleFood(x, y, food, seekingDistance) {
    const result = [];
    let nearestFood = [];

    for (const foodItem of food) {
        if (distance(x, y, foodItem.x, foodItem.y) <= seekingDistance) {
            nearestFood.push(foodItem);
        }
    }

    for (let i = 0; i < SECTORS_OF_VISION; i++) {
        let angleBegin, angleEnd;
        result[i] = 0;
        angleBegin = i * 2 * Math.PI / SECTORS_OF_VISION;
        angleEnd = (i + 1) * 2 * Math.PI / SECTORS_OF_VISION;
        for (const foodItem of nearestFood) {
            const angle = angleToPoint(x, y, foodItem.x, foodItem.y);
            const foodDistance = distance(x, y, foodItem.x, foodItem.y);
            if (angle >= angleBegin && angle < angleEnd) {
                if (result[i] < foodDistance) {
                    result[i] = foodDistance;
                }
            }
        }
    }

    return normalize(result);
}

/**
 *
 * @param x
 * @param y
 * @param maxX
 * @param maxY
 * @returns {number[]}
 */
function edgeDetection(x, y, maxX, maxY, distance) {
    let result = [0, 0, 0, 0];

    if (x < distance) {
        result[3] = 1;
    }
    if (Math.abs(x - maxX) < distance) {
        result[1] = 1;
    }
    if (y < distance) {
        result[0] = 1;
    }
    if (Math.abs(y - maxY) < distance) {
        result[2] = 1;
    }

    return result;
}

/**
 * Normalize vector
 *
 * {array} v
 * @returns {array}
 */
function normalize(v) {
    if (!Array.isArray(v) || v.length === 0) {
        throw new Error('Wrong parameter');
    }
    let result = v;
    const max = Math.max(...result);
    if (max !== 0) {
        result = result.map((e) => e / max);
    }
    return result;
}

/** Get the angle from one point to another */
function angleToPoint(x1, y1, x2, y2){
    const d = distance(x1, y1, x2, y2);
    const dx = (x2-x1) / d;
    const dy = (y2-y1) / d;

    let a = Math.acos(dx);
    a = dy < 0 ? 2 * Math.PI - a : a;
    return a;
}

/** Calculate distance between two points */
function distance(x1, y1, x2, y2){
    const dx = x1 - x2;
    const dy = y1 - y2;

    return Math.sqrt(dx * dx + dy * dy);
}
