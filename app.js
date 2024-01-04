(function() {
    function $(id) {
      return document.getElementById(id);
    };
    function repaintAll() {
      var data = [];
      var max = 0;
      var temp = {};
      var cur = typeField.value;
      var len = cur.length;
      var coordinates = app.coordinates;
      for(var i=0; i < len; i++){
        var key = cur.charAt(i);
        if(/^[A-Za-z]$/.test(key)){
          key = key.toUpperCase();
        }
        if(app.config.exclude && app.EXCLUDES.indexOf(key) == -1){
          var coord;
          coord = coordinates[key] || false;
          if(coord){
            for(var s = 0; s < coord.length; s += 2) {
              var joined = coord.slice(s, s+2).join(";");
              if(!temp[joined])
                temp[joined] = 0;
  
              temp[joined] += 1;
            }
          }
        }
      }
      for(var k in temp){
        var xy = k.split(";");
        var val = temp[k];
        console.log("k is: "+k+"\n"+"xy is: "+xy+"\n");
        data.push({x: xy[0], y: xy[1], count: val});
        if(val > max)
          max = val;
      }
  
      app.heatmap.store.setDataSet({max: max, data: data});
    };
  
    var typeField = $('typefield');
    var currentTypeFieldLen = typeField.value.length;
  
  
    app.init = function initialize() {
      var cfg = arguments[0] || {};
      app.configure(cfg);
      repaintAll();
    };
  
    app.configure = function configure(cfg) {
      var config = {};
      config.element = "keyboard";
      config.radius = cfg.radius || 50;
      config.visible = true;
      config.opacity = 40;
      if(cfg.gradient)
        config.gradient = cfg.gradient;
      app.coordinates = app.LAYOUTS[cfg.layout || "QWERTY"];
      var heatmap = h337.create(config);
      app.heatmap = heatmap;
    };
  
  
    window.onload = app.init;

    var lastValue = "";

    typeField.oninput = function() {
      var currentValue = typeField.value;
      if (Math.abs(lastValue.length - currentValue.length) >= 1) {
        repaintAll();
      } else {
        var key = (currentValue.length > lastValue.length) ? (currentValue.split(lastValue)[1]) : (lastValue.split(currentValue)[1]);
  
        if(/^[A-Za-z]$/.test(key)){
          key = key.toUpperCase();
        }
        if(app.config.exclude && app.EXCLUDES.indexOf(key) == -1){
          var coord = app.coordinates[key]
          if (coord) {
            for (var s = 0; s < coord.length; s+=2) {
              app.heatmap.store.addDataPoint.apply(app.heatmap.store,coord.slice(s, s+2));
            }
          }
        }
      }
      
      lastValue = currentValue;
    };

    document.getElementById("btn").addEventListener('click', function(){
      var currentValue = typeField.value;
      if (Math.abs(lastValue.length - currentValue.length) >= 1) {
        repaintAll();
      } else {
        var key = (currentValue.length > lastValue.length) ? (currentValue.split(lastValue)[1]) : (lastValue.split(currentValue)[1]);
        if(/^[A-Za-z]$/.test(key)){
          key = key.toUpperCase();
        }
        if(app.config.exclude && app.EXCLUDES.indexOf(key) == -1){
          var coord = app.coordinates[key]
          if (coord) {
            for (var s = 0; s < coord.length; s+=2) {
              app.heatmap.store.addDataPoint.apply(app.heatmap.store,coord.slice(s, s+2));
            }
          }
        }
      }
      lastValue = currentValue;
    });

  })();