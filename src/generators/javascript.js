import {javascriptGenerator} from 'blockly/javascript';
export const forBlock = Object.create(null);

// Wraps Arduino sketch with standard 2-space indentation
export function finishArduino(code, generator) {
  let setups = '';
  
  // Collect setup lines
  if (generator.setups_) {
    for (let key in generator.setups_) {
      setups += generator.setups_[key]
        .split('\n')
        .map(line => '  ' + line.trim())
        .join('\n') + '\n';
    }
  }

  // Collect all global functions (like getDistance_0)
  let globalFunctions = '';
  if (generator.globalFunctions_) {
    for (const funcName in generator.globalFunctions_) {
      globalFunctions += generator.globalFunctions_[funcName] + '\n\n';
    }
  }

  // Indent loop code by 2 spaces
  const indentedCode = code
    .split('\n')
    .map(line => line ? '  ' + line.trim() : '')
    .join('\n');

  return `${globalFunctions}void setup() {
${setups}
}

void loop() {
${indentedCode}
delay(200);
}`;
}

// Motor configuration generator
javascriptGenerator.forBlock['motor_configuration'] = function(block, generator) {
  const motor = block.getFieldValue('motor');
  const pin1 = block.getFieldValue('pin1');
  const pin2 = block.getFieldValue('pin2');
  const en = block.getFieldValue('en');

  generator.setups_ = generator.setups_ || {};
  generator.motorMap_ = generator.motorMap_ || {};

  // Remove old entry if motor number changed
  for (const key in generator.motorMap_) {
    if (generator.motorMap_[key].blockId === block.id && key !== String(motor)) {
      delete generator.motorMap_[key];
    }
  }

  // Save setup code including EN pin
  generator.setups_[block.id] = `// Motor ${motor} setup
pinMode(${pin1}, OUTPUT);
pinMode(${pin2}, OUTPUT);
pinMode(${en}, OUTPUT);`;

  // Save motor info for motor_power
  generator.motorMap_[String(motor)] = { pin1, pin2, en, blockId: block.id };

  return '';
};

// Motor power generator
forBlock['motor_power'] = function(block, generator) {
  const motorIDsRaw = block.getFieldValue('motorIDs') || '';
  const motorIDs = motorIDsRaw.split(',').map(id => id.trim()).filter(id => id !== '');
  const direction = block.getFieldValue('direction');
  const power = block.getFieldValue('power'); // HIGH/LOW

  const motorMap = generator.motorMap_ || {};
  let code = '';

  motorIDs.forEach(id => {
    const motor = motorMap[id];
    if (!motor) {
      code += '// ERROR: Motor ' + id + ' not configured!\n';
      return;
    }

    const enCode = power === 'HIGH'
      ? `analogWrite(${motor.en}, 255);`
      : `analogWrite(${motor.en}, 135);`;

    if (direction === 'FORWARD') {
      code += `  ${enCode}
  digitalWrite(${motor.pin1}, HIGH);
  digitalWrite(${motor.pin2}, LOW);\n`;
    } else if (direction === 'REVERSE') {
      code += `  ${enCode}
  digitalWrite(${motor.pin1}, LOW);
  digitalWrite(${motor.pin2}, HIGH);\n`;
    } else { 
      code += `  analogWrite(${motor.en}, 0);
  digitalWrite(${motor.pin1}, LOW);
  digitalWrite(${motor.pin2}, LOW);\n`;
    }
  });

  return code;
};

// Motor duration loop generator (with proper stop + indentation)
forBlock['motor_duration_loop'] = function(block, generator) {
  const time = block.getFieldValue('TIME'); // seconds
  let statements = javascriptGenerator.statementToCode(block, 'motors') || '';

  // Trim and indent statements
  statements = statements
    .split('\n')
    .map(line => line ? '  ' + line.trim() : '')
    .join('\n');

  const motorMap = generator.motorMap_ || {};
  let stopCode = '';
  for (const id in motorMap) {
    const m = motorMap[id];
    stopCode += `  analogWrite(${m.en}, 0);
  digitalWrite(${m.pin1}, LOW);
  digitalWrite(${m.pin2}, LOW);\n`;
  }

  return `${statements}
  delay(${time} * 1000);
${stopCode}`;
};

// IR sensor generator
forBlock['ir_sensor_configuration'] = function(block, generator) {
  const sensorID = block.getFieldValue('sensor');
  const Pin = block.getFieldValue('Pin');

  generator.setups_ = generator.setups_ || {};
  generator.irMap_ = generator.irMap_ || {};

  generator.irMap_[sensorID] = { Pin, blockId: block.id };

  generator.setups_[block.id] = `// IR Sensor ${sensorID} setup
pinMode(${Pin}, INPUT);`;

  return '';
};

// Ultrasonic sensor generator
forBlock['ultrasonic_sensor_configuration'] = function(block, generator) {
  const sensorID = block.getFieldValue('sensor');
  const trig = block.getFieldValue('TRIG');
  const echo = block.getFieldValue('ECHO');

  generator.setups_ = generator.setups_ || {};
  generator.ultraMap_ = generator.ultraMap_ || {};

  // Store sensor info
  generator.ultraMap_[sensorID] = { trig, echo, blockId: block.id };

  // Setup pins 
  generator.setups_[block.id] = `// Ultrasonic Sensor ${sensorID} setup
pinMode(${trig}, OUTPUT);
pinMode(${echo}, INPUT);`;

  return ''; 
};

// Ultrasonic sensor measuring distance 
forBlock['ultrasonic_distance'] = function(block, generator) {
  const sensorID = block.getFieldValue('sensor');
  const sensor = (generator.ultraMap_ || {})[sensorID];
  if (!sensor) return [`// ERROR: Sensor ${sensorID} not configured!`, generator.ORDER_ATOMIC];

  generator.globalFunctions_ = generator.globalFunctions_ || {};
  generator.blockFunctions_ = generator.blockFunctions_ || {}; // NEW: map blockId -> function name

  const funcName = `getDistance_${sensorID}`;
  if (!generator.globalFunctions_[funcName]) {
    const funcCode = `
long ${funcName}() {

  digitalWrite(${sensor.trig}, LOW);
  delayMicroseconds(2);
  digitalWrite(${sensor.trig}, HIGH);
  delayMicroseconds(10);
  digitalWrite(${sensor.trig}, LOW);

  long duration = pulseIn(${sensor.echo}, HIGH);
  long distance = duration * 0.034 / 2; // cm
  return distance;
}`;
    generator.globalFunctions_[funcName] = funcCode;
    generator.blockFunctions_[block.id] = funcName; // track which block added this function
  }

  return [`${funcName}()`, generator.ORDER_ATOMIC];
};

Object.assign(javascriptGenerator.forBlock, forBlock);