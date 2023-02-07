/* eslint-disable no-fallthrough */
/* eslint-disable no-case-declarations */
/* eslint-disable camelcase */
/* eslint-disable no-debugger */
/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable valid-jsdoc */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const TargetType = require('../../extension-support/target-type');

const {buttonMap, joyMap} = require('./gamepad');
const {pressedMenu, readValuesMenu} = require('./menus');
const {USB} = require('./usb');

const haveEvents = 'ongamepadconnected' in window;
const controllers = {};

class GamepadExtension {
    /**
     *
     * @param {Runtime} runtime
     */
    constructor (runtime) {
        this.runtime = runtime;
        this.USB = new USB();
    }

    getInfo () {
        return {
            id: 'gamepad',
            name: 'Gamepad',
            color1: '#FF8C1A',
            color2: '#DB6E00',
            blocks: [
                // {
                //     opcode: 'usb',
                // },
                {
                    blockAllThreads: true,
                    blockType: BlockType.HAT,
                    opcode: 'listen',
                    text: 'Listen to Gamepad [INDEX]',
                    arguments: {
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    blockType: BlockType.REPORTER,
                    opcode: 'get_gamepad',
                    text: 'Next player [INDEX] [VAL]',
                    arguments: {
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        VAL: {
                            type: ArgumentType.NUMBER
                        }
                    }
                },
                {
                    blockType: BlockType.REPORTER,
                    opcode: 'get_value',
                    text: 'Gamepad [INDEX] get value [VAL] (reporter)',
                    arguments: {
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        VAL: {
                            type: ArgumentType.STRING,
                            menu: 'read_vals'
                        }
                    }
                },
                {
                    blockAllThreads: true,
                    blockType: BlockType.BOOLEAN,
                    opcode: 'is_pressed',
                    text: 'Gamepad [INDEX] is pressed [VAL]',
                    arguments: {
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        VAL: {
                            type: ArgumentType.STRING,
                            menu: 'pressed'
                        }
                    }
                },
                {
                    blockAllThreads: true,
                    blockType: BlockType.BOOLEAN,
                    opcode: 'is_released',
                    text: 'Gamepad [INDEX] is released [VAL]',
                    arguments: {
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        VAL: {
                            type: ArgumentType.STRING,
                            menu: 'pressed'
                        }
                    }
                }
                // {
                //     blockAllThreads: true,
                //     blockType: BlockType.HAT,
                //     opcode: 'when_pressed',
                //     text: 'Gamepad [INDEX] when pressed [VAL]',
                //     arguments: {
                //         INDEX: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0
                //         },
                //         VAL: {
                //             type: ArgumentType.STRING,
                //             menu: 'pressed'
                //         }
                //     }
                // },
                // {
                //     blockAllThreads: true,
                //     blockType: BlockType.HAT,
                //     opcode: 'when_released',
                //     text: 'Gamepad [INDEX] when released [VAL] (hat)',
                //     arguments: {
                //         INDEX: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0
                //         },
                //         VAL: {
                //             type: ArgumentType.STRING,
                //             menu: 'pressed'
                //         }
                //     }
                // }
            ],
            menus: {
                pressed: pressedMenu,
                read_vals: readValuesMenu
            }
        };
    }

    /**
     *
     * @param {object} args
     * @param {BlockUtility} info
     * @param {object} block
     * @return
     */
    listen (args, info, block) {
        this.USB.update(args.INDEX);

        return true;
    }

    /**
     *
     * @param {object} args
     * @param {number} args.INDEX
     * @param {number} args.VAL
     * @returns {number}
     */
    get_gamepad (args, info, block){
        console.log();
        const index = (parseInt(args.INDEX, 10) + parseInt(args.VAL, 10)) % this.USB.controllers.length;
       
        return index;
    }

    /**
     * Gets direction and distance calculated values for each joystick
     * @param {object} args
     * @param {number} args.INDEX
     * @param {string} args.VAL
     * @param {BlockUtility} info
     * @param {object} block
     * @return
     */
    get_value (args, info, block) {
        let returnVal = null;
        
        const controller = this.USB.controllers[args.INDEX];
        
        switch (args.VAL) {
        case 'all':
            returnVal = controller;
            break;

        case 'direction_0':
            returnVal =
            controller?.movement[0]?.direction || 0;
            break;

        case 'direction_1':
            returnVal =
            controller?.movement[1]?.direction || 0;
            break;

        case 'distance_0':
            returnVal =
            controller?.movement[0]?.distance || 0;
            break;

        case 'distance_1':
            returnVal =
            controller?.movement[1]?.distance || 0;
            break;

        case 'timestamp':
            returnVal = window.performance.now();
            break;
        }

        return returnVal;
    }
    
    /**
     * Callback for HAT event when button is pressed
     * @param {object} args
     * @param {number} args.INDEX
     * @param {string} args.VAL
     * @param {BlockUtility} info
     * @param {object} block
     * @returns
     */
    is_pressed (args, info, block){
        return this.when_pressed(args, info, block);
    }

    when_pressed (args, info, block) {
        const controller = this.USB.controllers[args.INDEX];
        const button = buttonMap[args.VAL];

        const is_pressed = controller?.buttons[button]?.pressed;

        return is_pressed;
    }

    /**
     *
     * @param {*} args
     * @param {*} info
     * @param {*} block
     * @returns
     */
    is_released (args, info, block){
        return this.when_released(args, info, block);
    }

    when_released (args, info, block) {
        const controller = this.USB.controllers[args.INDEX];
        const button = buttonMap[args.VAL];

        const is_pressed = controller?.buttons[button]?.released;

        return is_pressed;
    }
}

module.exports = GamepadExtension;
