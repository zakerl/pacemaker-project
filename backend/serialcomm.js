var serialport = require('serialport');
var express = require('express'); // used tosetup routes for backend processing
var cors = require('cors');
// const { database } = require('firebase-functions/lib/providers/firestore');
var ByteLength = require('@serialport/parser-byte-length');
var bodyParser = require('body-parser');

// SERIAL COMMUNICATION
var port = new serialport('COM7',{
  baudRate: 115200,
  //parser: new Readline("\r\n")
})
/*
Express routing handles packing and sending the data to the 
pacemaker using post requests.  The data is taken from
the PaceMode.js form, packaged, and then the writeToPort function 
is called to actually write to the port.
*/
var app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const expressPort = 8080;
//testing
// function dec2bin(dec){
//   return (dec >>> 0).toString(2);
// }
// var a = new Array(32);
// a =[dec2bin(32)];
// console.log(a);
//
app.post('/writeToPort', (req, res) => {
  var buffer = Buffer.alloc(44)
  //var buf = Buffer.alloc(59)
  var buf;

  for(let i=2; i<39; i++){
    buffer[i] = 0;
  }
  // default values all set to zero
  var mode, currentMode, action = 0;
  var currentMode = 0;
  var action = 0;
  var LRL, URL, Amp, PW, AVD, Aamp, Vamp, APW, VPW = 0;
  var Sensitivity, RP, PVARP, Hysteresis, RateSmoothingUp,RateSmoothingDown, ActivityThreshold, ReactionTime,
      RecoveryTime, SensorRate = 0;

  // set the variables from the post requet
  currentMode = req.body.modeVal
  action = req.body.action;
  if(req.body.LRL){
    LRL = req.body.LRL;
  } 
  if(req.body.URL){
    URL = req.body.URL;
  } 
  if(req.body.Aamp){
    Aamp = req.body.Aamp;
  } 
  if(req.body.APW){
    APW = req.body.APW;
  } 
  if(req.body.Vamp){
    Vamp = req.body.Vamp;
  } 
  if(req.body.VPW){
    VPW = req.body.VPW;
  } 
  if(req.body.AVD){
    AVD = req.body.AVD;
  }
  if(req.body.Sensitivity){
    Sensitivity = req.body.Sensitivity;
  } 
  if(req.body.RP){
    RP = req.body.RP;
  } 
  if(req.body.PVARP){
    PVARP = req.body.PVARP;
  }
  if(req.body.Hysteresis){
    Hysteresis = req.body.Hysteresis;
  }
  if(req.body.RateSmoothingUp){
    RateSmoothingUp = req.body.RateSmoothingUp;
  }
  if(req.body.RateSmoothingDown){
    RateSmoothingDown = req.body.RateSmoothingDown;
  }
  if(req.body.ActivityThreshold){
    ActivityThreshold = req.body.ActivityThreshold;
  } 
  if(req.body.ReactionTime){
    ReactionTime = req.body.ReactionTime;
  } 
  if(req.body.RecoveryTime){
    RecoveryTime = req.body.RecoveryTime;
  }
  if(req.body.SensorRate){
    SensorRate = req.body.SensorRate;
  }

  // console.log(currentMode);
  
  switch(currentMode){
    case 'VOO':
      mode = 1;
      break;
    case 'AOO':
      mode = 2;
      break;
    case 'VVI':
      mode = 3;
      break;
    case 'AAI':
      mode = 4;
      break;
    case 'DOO':
      mode = 5;
      break;
    case 'VOOR':
      mode = 6;
      break;
    case 'AOOR':
      mode = 7;
      break;
    case 'VVIR':
      mode = 8;
      break;
    case 'AAIR':
      mode = 9;
      break;
    case 'DOOR':
      mode = 10;
      break;
    default:
      mode = 1;
  } 
//teting


  // package data here

  buffer[0] = 0x16; //TO CHECK BEGININNG OF DATA
  buffer[1] = action; //FOR READING FROM SIMULINK/BOARD  
  buffer[2] = mode; //MODE
  buffer.writeFloatLE(Sensitivity,3); //Atrial Sensitivity
  buffer.writeFloatLE(Sensitivity,7);//Ventricular Sensitivity
  buffer.writeFloatLE(Vamp,11);//Vent_Pulse Amp
  buffer[15]=LRL; // LRL OR PPM 
  buffer[16]=VPW; //Ventricular Pulse width
  buffer.writeUInt16LE(RP,17); //Ref Period
  buffer.writeUInt16LE(PVARP,19); //PVARP
  buffer[21]=0; //Hysteresis enable
  buffer.writeUInt16LE(Hysteresis,22); //Hysteresis Value
  buffer[24]=URL; //URL
  buffer[25]=RateSmoothingUp; //Rate Smoothing UP 
  buffer[26]=RateSmoothingDown; //Rate smoothing Down
  buffer.writeUInt16LE(AVD,27); //Fixed AV Delay
  buffer[29]= SensorRate;//Max sensor Limit in PPM
  buffer.writeFloatLE(ActivityThreshold,30);//Activity Threshold
  buffer[34]=ReactionTime;//Reaction Time in seconds
  buffer.writeFloatLE(RecoveryTime,35);//Recovery Time in Minutes
  buffer[39] = APW; //Atrial Pulse Width
  buffer.writeFloatLE(Aamp,40); // Atr Pulse Amp
   
  //TEST

  //TEST DONE
  if(buffer[1]==0x55){
    console.log('write')
    writeToPort(buffer);
  }
  if(buffer[1]==0x22){
    const parser = port.pipe(new ByteLength({length: 58}))
    console.log("read");
      writeToPort(buffer);
      // port.on('readable', function (data) {
      //   port.read() 
      // })
      parser.on('data', function (data) {
        port.read();
        console.log(data);
      })
  }
  //console.log(buffer);
  // if(buffer[1]==0x55){ // uncomment this when done testing API calls
  //     buffer[1] = 0x22;
  //     //writeToPort(buffer);
  // }
  // if(buffer[1]==0x22){
  //   port.on('data', function (data) {
  //     console.log(data);
  //     })
  //   }
  
})

// initialize express port
app.listen(expressPort, process.env.IP, () => {
  console.log(`back end express server started on port: ${expressPort}`);
});
// Pipe the data into another stream (like a parser or standard out)
// var lineStream = port.pipe(new Readline());

const writeToPort = (buffer) => {
  port.write(buffer, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log("message written");
  })
}





// port.on('readable', function (data) {
//   port.read();
//   //console.log(port.read()); 
// })
//Switches the port into "flowing mode"

// lineStream.on('data', function (data) {
//   console.log('Data:', data.toString('utf8'));
// });




