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
  colour: 225
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
  colour: 210
};

const motorDurationLoop = {
  type: "motor_duration_loop",
  message0: "run motors for %1 seconds %2",
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
  colour: 120
};

// Create the block definitions for the JSON-only blocks.
// This does not register their definitions with Blockly.
// This file has no side effects!
export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  motorConfiguration,
  motorPower,
  motorDurationLoop,
]);
