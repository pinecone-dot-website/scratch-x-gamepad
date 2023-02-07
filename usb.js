/* eslint-disable no-shadow */
/* eslint-disable valid-jsdoc */
class USB {
    constructor () {
        this.controllers = [
            {
                axes: [],
                buttons: [],
                movement: []
            },
            {
                axes: [],
                buttons: [],
                movement: []
            }
        ];
    }

    /**
     * array map callback
     * @param {object} button
     * @param {number} i
     * @returns {object}
     */
    mapButtons (button, i) {
        const value = {
            down: button.pressed,
            pressed: button.pressed > this[i]?.down,
            released: button.pressed < this[i]?.down
        };
        
        return value;
    }

    /**
     *
     * @param {number} index
     */
    update (index) {
        const gamepads = navigator.getGamepads();

        if (gamepads[index]) {
            // map array of 4 joystick values to 2 x,y pairs
            const axes = gamepads[index].axes.map(val => val.toFixed(2));

            // map array of 16 buttons to cleaned vals
            const buttons = gamepads[index].buttons.map(
                this.mapButtons,
                this.controllers[index].buttons
            );

            //
            const movement = axes.reduce((list, _, index) => {
                if (index % 2 === 0) {
                    list.push({
                        direction:
                            (
                                ((Math.atan2(axes[index + 1], axes[index]) * 180)) /
                            Math.PI
                            ) + 90,
                        distance: Math.sqrt(
                            Math.abs(axes[index]) + Math.abs(axes[index + 1])
                        )
                    });
                }

                return list;
            }, []);

            this.controllers[index] = {
                axes: axes,
                buttons,
                movement
                // _gamepad: gamepads[index]
            };
        }
    }
}

module.exports = {USB};
