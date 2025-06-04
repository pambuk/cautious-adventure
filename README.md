# Cautious Adventure - The Lifeguard Game

Cautious Adventure is a lifeguard game where the player's main goal is to save drowning beach visitors. The game progresses in days, with each day presenting increasing challenges.

This game was originally created for the [One Game A Month](http://onegameamonth.com/) challenge in August 2018.

You can play the game online: [https://pambuk.github.io/cautious-adventure/build/](https://pambuk.github.io/cautious-adventure/build/)

## Game Features

*   **Lifeguard Gameplay:** Control a lifeguard to rescue visitors in distress.
*   **Progressive Difficulty:** Each day increases in difficulty with more visitors and faster events.
*   **Visitor Behavior:** Beachgoers will swim, relax on blankets, and can start drowning due to waves or fatigue.
*   **Wave System:** Dynamic waves appear and can endanger swimmers.
*   **Scoring:** Earn points for each visitor saved.
*   **Day System:** The game is structured in days. Survive the day to proceed to the next.
*   **Game Over:** The game ends if too many visitors are lost.
*   **Player Stamina:** The lifeguard has a stamina bar that depletes with activity and can be refilled by visiting the corn cart.
*   **Pixel Art Graphics:** Retro pixel art style.
*   **Sound Effects:** Includes sound effects for game events like waves and whistles.

## Development Environment

The game is developed using the following technologies:

*   **Game Engine:** [Phaser 3](https://phaser.io/phaser3)
*   **Programming Language:** JavaScript (ES6+)
*   **Package Management:** [Node.js](https://nodejs.org/) with `npm` or `yarn`
*   **Bundler:** [Webpack](https://webpack.js.org/)
*   **Transpiler:** [Babel](https://babeljs.io/) for compiling modern JavaScript.

## How to Run

To run the game locally for development:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pambuk/cautious-adventure.git
    cd cautious-adventure
    ```
2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```
3.  **Start the development server:**
    Using npm:
    ```bash
    npm run dev
    ```
    Or using yarn:
    ```bash
    yarn run dev
    ```
    This will typically open the game in your default web browser at `http://localhost:8080`.

## How to Build

To create a production build of the game:

1.  **Ensure dependencies are installed** (see "How to Run").
2.  **Run the build script:**
    Using npm:
    ```bash
    npm run build
    ```
    Or using yarn:
    ```bash
    yarn run build
    ```
    The production-ready files will be placed in the `build/` directory.

## Possible Future Improvements

While the game is functional, here are some ideas for future enhancements:

*   **More Visitor Variety:** Introduce different types of beach visitors with unique behaviors or needs.
*   **Player Power-ups:** Add temporary abilities or items for the lifeguard (e.g., speed boost, binoculars).
*   **Varied Environments:** Different beach layouts, obstacles, or changing weather conditions (e.g., storms, tides).
*   **Online Leaderboards:** Implement a system to track and display high scores.
*   **Expanded Audio:** Add background music and more diverse sound effects.
*   **Advanced AI:** Improve visitor AI for more complex and realistic interactions.
*   **Tutorial Mode:** A brief tutorial to explain game mechanics to new players.
*   **Mobile Support:** Optimize controls and layout for mobile devices.
