import * as Blockly from 'blockly';
import {blocks} from './blocks/text';
import {forBlock, finishArduino} from './generators/javascript';
import {javascriptGenerator} from 'blockly/javascript';
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import './index.css';

// Register blocks
Blockly.common.defineBlocks(blocks);

// Register custom generators
Object.assign(javascriptGenerator.forBlock, forBlock);

// Inject Blockly
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});
const codeDiv = document.getElementById('generatedCode');
const outputDiv = document.getElementById('output');

// Run code and wrap motor blocks into setup()
const runCode = () => {
  const loopCode = javascriptGenerator.workspaceToCode(ws);
  const fullCode = finishArduino(loopCode, javascriptGenerator);
  codeDiv.innerText = fullCode;
};

// Initial run
runCode();

// Run on workspace changes
ws.addChangeListener((e) => {
  if (e.isUiEvent || e.type === Blockly.Events.FINISHED_LOADING || ws.isDragging()) return;
  runCode();
});

ws.addChangeListener((event) => {
  if (event.type === Blockly.Events.BLOCK_DELETE) {
    // event.ids is an array of deleted block IDs
    event.ids.forEach(id => {
      // Remove from setups_
      if (javascriptGenerator.setups_ && javascriptGenerator.setups_[id]) {
        delete javascriptGenerator.setups_[id];
      }

      // Also remove from motor map if it exists
      if (javascriptGenerator.motorMap_) {
        // Look through all motors to find which block ID matches
        for (const motorID in javascriptGenerator.motorMap_) {
          const motor = javascriptGenerator.motorMap_[motorID];
          // Compare block IDs (we can store block.id in motorMap too)
          if (motor.blockId === id) {
            delete javascriptGenerator.motorMap_[motorID];
          }
        }
      }
    });

    runCode(); // regenerate the Arduino code
  }
});