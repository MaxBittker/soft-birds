import getUserMedia from "getusermedia";

function audioAnalyzer(options) {
  getUserMedia({ audio: true }, function(err, stream) {
    if (err) {
      options.error && options.error(err);
      return;
    }

    //
    var context = new AudioContext();
    var analyser = context.createAnalyser({
      fftSize: 512,
      smoothingTimeConstant: 0.5
    });
    let source = context.createMediaStreamSource(stream);
    source.connect(analyser);
    options.done(analyser, {});
  });
}

export { audioAnalyzer };
