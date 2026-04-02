import {javascriptGenerator} from 'blockly/javascript';
export const forBlock = Object.create(null);

/**
 * Wraps Arduino sketch
 */
export function finishArduino(code, generator) {
  let setups = '';

  if (generator.setups_) {
    for (let key in generator.setups_) {
      setups += generator.setups_[key] + '\n';
    }
  }

  return `void setup() {
${setups}
}

void loop() {
${code}
}`;
}

function getMotorMap(generator) {
  // Use a dedicated object on the generator to track motors
  if (!generator.motorMap_) {
    generator.motorMap_ = {};
  }
  return generator.motorMap_;
}

/**
 * Motor block generator → setup only
 */
javascriptGenerator.forBlock['motor_configuration'] = function(block, generator) {
  const motor = block.getFieldValue('motor');  // motor number
  const pin1 = block.getFieldValue('pin1');
  const pin2 = block.getFieldValue('pin2');

  generator.setups_ = generator.setups_ || {};
  generator.motorMap_ = generator.motorMap_ || {};

  // If motor number has changed, remove old entry
  for (const key in generator.motorMap_) {
    if (generator.motorMap_[key].blockId === block.id && key !== String(motor)) {
      delete generator.motorMap_[key];
    }
  }

  // Save setup code
  generator.setups_[block.id] = `  // Motor ${motor} setup
  pinMode(${pin1}, OUTPUT);
  pinMode(${pin2}, OUTPUT);`;

  // Save motor info for motor_power to use
  generator.motorMap_[String(motor)] = { pin1, pin2, blockId: block.id };

  return ''; // nothing goes in loop
};

forBlock['motor_power'] = function(block, generator) {
  // Get the text input, split by commas
  const motorIDsRaw = block.getFieldValue('motorIDs') || '';
  const motorIDs = motorIDsRaw.split(',').map(id => id.trim()).filter(id => id !== '');
  
  const direction = block.getFieldValue('direction');
  const time = block.getFieldValue('time');

  const motorMap = generator.motorMap_ || {};
  let code = '';

  motorIDs.forEach(id => {
    const motor = motorMap[id];
    if (!motor) {
      code += `// ERROR: Motor ${id} not configured!\n`;
      return;
    }

    if (direction === 'FORWARD') {
      code += `digitalWrite(${motor.pin1}, HIGH);\ndigitalWrite(${motor.pin2}, LOW);\n`;
    } else if (direction === 'REVERSE') {
      code += `digitalWrite(${motor.pin1}, LOW);\ndigitalWrite(${motor.pin2}, HIGH);\n`;
    } else { // STOP
      code += `digitalWrite(${motor.pin1}, LOW);\ndigitalWrite(${motor.pin2}, LOW);\n`;
    }
  });

  code += `delay(${time} * 1000);\n`;
  return code;
};



/**
 * Keep existing custom generators (like add_text) without overriding all built-in blocks
 */
Object.assign(javascriptGenerator.forBlock, forBlock);