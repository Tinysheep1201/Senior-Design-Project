/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

// Create a custom block called 'add_text' that adds
// text to the output div on the sample app.
// This is just an example and you should replace this with your
// own custom blocks.

const motorConfiguration =
{
  type: "motor_configuration",
  tooltip: "",
  helpUrl: "",
  message0: "Motor %1 Pin %2 Pin %3",
  args0: [
    {
      type: "field_number",
      name: "motor",
      value: 0,
      min: 0
    },
    {
      type: "field_number",
      name: "pin1",
      value: 1,
      min: 0
    },
    {
      type: "field_number",
      name: "pin2",
      value: 2,
      min: 0
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 300

}
                    
const motorPower = {
  type: 'motor_power',
  message0: 'Motors %1 Direction %2',
  args0: [
    {
      type: 'field_input',
      name: 'motorIDs', // can enter "0,1" for multiple motors
      text: '0'
    },
    {
      type: 'field_dropdown',
      name: 'direction',
      options: [
        ['Forward', 'FORWARD'],
        ['Reverse', 'REVERSE'],
        ['Stop', 'STOP']
      ]
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 300
};

const motorDurationLoop = {
  type: "motor_duration_loop",
  message0: "run motors for %1 second(s) %2",
  args0: [
    {
      type: "field_number",
      name: "TIME",
      value: 1,
      min: 0
    },
    {
      type: "input_statement",
      name: "motors"
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 300
};

const irSensorConfiguration = {
  type: "ir_sensor_configuration",
  message0: "IR Sensor %1 Left Pin %2 Right Pin %3",
  args0: [
    {
      type: "field_number",
      name: "sensor",
      value: 0,
      min: 0
    },
    {
      type: "field_number",
      name: "leftPin",
      value: 2,
      min: 0
    },
    {
      type: "field_number",
      name: "rightPin",
      value: 3,
      min: 0
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 0
};

const ultrasonicSensor = {
  type: "ultrasonic_sensor",
  message0: "Ultrasonic trig %1 echo %2",
  args0: [
    {
      type: "field_number",
      name: "TRIG",
      value: 9,
      min: 0
    },
    {
      type: "field_number",
      name: "ECHO",
      value: 10,
      min: 0
    }
  ],
  output: "Number",
  colour: 0
};

// Create the block definitions for the JSON-only blocks.
// This does not register their definitions with Blockly.
// This file has no side effects!
export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  motorConfiguration,
  motorPower,
  motorDurationLoop,
  irSensorConfiguration,
  ultrasonicSensor,
]);
