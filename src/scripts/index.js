import '../styles/index.scss';
import * as constants from './const.mjs';
import Game from './game.mjs';
import { RUN_STATE } from './game.mjs';
import population from './population.mjs';
import neataptic from 'neataptic';

document.addEventListener('DOMContentLoaded', function () {
    let isPaused = false;
    let isFullPanelMode = true;
    const liveGameField = document.getElementById(constants.GAME_FIELD_ID);
    let liveGame = new Game(
        liveGameField,
        constants.POPULATION_SIZE,
        population.map((brain) => neataptic.Network.fromJSON(brain))
    );
    liveGame.start();

    let chartData = getInitialChartData();
    const chart = new Chart('#chart', {
        type: 'line',
        height: 200,
        data: chartData
    });

    window.setInterval(() => {
        if (isPaused) {
            return;
        }

        if (liveGame.currentState === RUN_STATE) {
            if (liveGame.foodStore.length < liveGame.creatures.length * constants.FOOD_RATE_COEFFICIENT) {
                liveGame.addFood();
            }
            liveGame.run();
        } else {
            updateGraph(
                liveGame.neat.population.map((brain) => brain.score),
                liveGame.neat.generation
            );
            liveGame.mutate(); // next generation
            liveGame.start();
        }
    }, constants.DELAY);

    window.setInterval(() => {
        if (isPaused) {
            return;
        }

        if (liveGame.currentState === RUN_STATE) {
            displayStatistics(
                liveGame.neat.population.map((brain) => brain.score),
                liveGame.creatures.length,
                liveGame.neat.generation
            );
        }
    }, constants.STATISTICS_DELAY);

    liveGameField.addEventListener('click', (event) => {
        liveGame.addFood(event.clientX, event.clientY);
    });

    document.getElementById('pauseCheckbox').addEventListener('change', (event) => {
        if(event.target.checked) {
            isPaused = true;
        } else {
            isPaused = false;
        }
    });

    const toggleView = document.getElementById('toggleView');
    toggleView.addEventListener('click', (event) => {
        const shortPanel = document.getElementById('shortPanel');
        const fullPanel = document.getElementById('fullPanel');

        isFullPanelMode = !isFullPanelMode;
        if (isFullPanelMode) {
            toggleView.value = '[-]';
            fullPanel.style.display = 'block';
            shortPanel.style.display = 'none';
        } else {
            toggleView.value = '[+]';
            fullPanel.style.display = 'none';
            shortPanel.style.display = 'block';
        }
    });

    /**
     *
     * @param {Number[]} scores
     * @param {Number} aliveCount
     * @param {Number} generation
     */
    function displayStatistics(scores, aliveCount, generation) {
        const sum = scores.reduce((sum, x) => sum + x);
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const avg = sum / scores.length;

        document.querySelectorAll('.min').forEach((element) => element.innerHTML = '' + min.toFixed(2));
        document.querySelectorAll('.max').forEach((element) => element.innerHTML = '' + max.toFixed(2));
        document.querySelectorAll('.avg').forEach((element) => element.innerHTML = '' + avg.toFixed(2));
        document.querySelectorAll('.alive').forEach((element) => element.innerHTML = '' + aliveCount);
        document.querySelectorAll('.generation').forEach((element) => element.innerHTML = '' + generation);
    }

    function updateGraph(scores, generation) {
        const sum = scores.reduce((sum, x) => sum + x);
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const avg = sum / scores.length;

        chartData.labels.push(generation.toString());
        chartData.datasets[0].values.push(max.toFixed(2));
        chartData.datasets[1].values.push(avg.toFixed(2));
        chartData.datasets[2].values.push(min.toFixed(2));

        if (chartData.labels.length > 10) {
            chartData.labels.shift();
            chartData.datasets.forEach(d => d.values.shift());
        }
        chart.update(chartData);
    }

    function getInitialChartData() {
        return {
            labels: [],
            datasets: [
                {
                    name: 'Max',
                    values: []
                },
                {
                    name: 'Average',
                    values: []
                },
                {
                    name: 'Min',
                    values: []
                }
            ]
        };
    }
});
