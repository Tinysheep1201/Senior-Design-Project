import {javascriptGenerator} from 'blockly/javascript';
export const forBlock = Object.create(null);

// Wraps Arduino sketch with standard 2-space indentation
export function finishArduino(code, generator) {
  let setups = '';

  if (generator.setups_) {
    for (let key in generator.setups_) {
      // indent setup lines by 2 spaces
      setups += generator.setups_[key]
        .split('\n')
        .map(line => '  ' + line.trim())
        .join('\n') + '\n';
    }
  }

  // indent loop code by 2 spaces
  const indentedCode = code
    .split('\n')
    .map(line => line ? '  ' + line.trim() : '')
    .join('\n');

  return `void setup() {
${setups}
}

void loop() {
${indentedCode}
  while(true);
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
  const leftPin = block.getFieldValue('leftPin');
  const rightPin = block.getFieldValue('rightPin');

  generator.setups_ = generator.setups_ || {};
  generator.irMap_ = generator.irMap_ || {};

  generator.irMap_[sensorID] = { leftPin, rightPin, blockId: block.id };

  generator.setups_[block.id] = `// IR Sensor ${sensorID} setup
pinMode(${leftPin}, INPUT);
pinMode(${rightPin}, INPUT);`;

  return '';
};

// Ultrasonic sensor generator
forBlock['ultrasonic_sensor'] = function(block, generator) {
  const trig = block.getFieldValue('TRIG');
  const echo = block.getFieldValue('ECHO');

  generator.setups_ = generator.setups_ || {};

  generator.setups_['ULTRA_' + trig] = `
pinMode(${trig}, OUTPUT);
pinMode(${echo}, INPUT);`;

  const func = generator.provideFunction_(
    'getDistance',
    `
long ${generator.FUNCTION_NAME_PLACEHOLDER_}(int trig, int echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  long duration = pulseIn(echo, HIGH);
  long distance = duration * 0.034 / 2;
  return distance;
}`
  );

  return [`${func}(${trig}, ${echo})`, generator.ORDER_ATOMIC];
};

Object.assign(javascriptGenerator.forBlock, forBlock);