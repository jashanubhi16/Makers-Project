/* 
 * heatmap.js 1.0 -	JavaScript Heatmap Library
 *
 * Copyright (c) 2011, Patrick Wied (http://www.patrick-wied.at)
 * Dual-licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and the Beerware (http://en.wikipedia.org/wiki/Beerware) license.
 */ 

(function(w){
	var heatmapFactory = (function(){
	function store(hmap){
		var _ = {
			data: [],
			heatmap: hmap
		};
		this.max = 1;
		this.get = function(key){
			return _[key];
		},
		this.set = function(key, value){
			_[key] = value;
		};
	};
	
	store.prototype = {
		addDataPoint: function(x, y){
			if(x < 0 || y < 0)
				return;
			var heatmap = this.get("heatmap"),
			data = this.get("data");
			if(!data[x]) data[x] = [];
			if(!data[x][y]) data[x][y] = 0;
			data[x][y]+=(arguments.length<3)?1:arguments[2];
            this.set("data", data);
			if(this.max < data[x][y]){
				this.max = data[x][y];
				heatmap.get("actx").clearRect(0,0,heatmap.get("width"),heatmap.get("height"));
				for(var one in data)					
					for(var two in data[one])
						heatmap.drawAlpha(one, two, data[one][two]);
				return;
			}
			heatmap.drawAlpha(x, y, data[x][y]);
		},
        dumpData: function(){
            var data = this.get("data");
            for(var one in data)					
					for(var two in data[one])
                        if(console)
                            console.log(one, two, data[one][two], this.max);
        },
		setDataSet: function(obj){

			var heatmap = this.get("heatmap"),
			data = [],
			d = obj.data,
			dlen = d.length;
			heatmap.clear();
            this.max = obj.max;

			while(dlen--){
				var point = d[dlen];
				heatmap.drawAlpha(point.x, point.y, point.count);
				if(!data[point.x]) data[point.x] = [];
				if(!data[point.x][point.y]) data[point.x][point.y] = 0;
                data[point.x][point.y]=point.count
			}
            this.set("data", data);
		},
		exportDataSet: function(){
			var data = this.get("data");
			var exportData = [];
			for(var one in data){
				if(one === undefined)
					continue;
				for(var two in data[one]){
					if(two === undefined)
						continue;
					exportData.push({x: parseInt(one, 10), y: parseInt(two, 10), count: data[one][two]});
				}
			}
					
			return exportData;
		},
		generateRandomDataSet: function(points){
			var heatmap = this.get("heatmap"),
			w = heatmap.get("width"),
			h = heatmap.get("height");
			var randomset = {},
			max = Math.floor(Math.random()*1000+1);
			randomset.max = max;
			var data = [];
			while(points--){
				data.push({x: Math.floor(Math.random()*w+1), y: Math.floor(Math.random()*h+1), count: Math.floor(Math.random()*max+1)});
			}
			randomset.data = data;
			this.setDataSet(randomset);
		}
	};
	function heatmap(config){
		var _ = {
			radiusIn : 20,
			radiusOut : 40,
			element : {},
			canvas : {},
			acanvas: {},
			ctx : {},
			actx : {},
			visible : true,
			width : 0,
			height : 0,
			max : false,
			gradient : false,
			opacity: 180,
            debug: false
		};
		this.store = new store(this);
		
		this.get = function(key){
			return _[key];
		},
		this.set = function(key, value){
			_[key] = value;
		};
		this.configure(config);
		this.init();
	};
	heatmap.prototype = {
		configure: function(config){
				if(config.radius){
					var rout = config.radius,
					rin = parseInt(rout/2, 10);					
				}
				this.set("radiusIn", rin || 15),
				this.set("radiusOut", rout || 40),
				this.set("element", (config.element instanceof Object)?config.element:document.getElementById(config.element));
				this.set("visible", config.visible);
				this.set("max", config.max || false);
				this.set("gradient", config.gradient || { 0.45: "rgb(0,0,255)", 0.55: "rgb(0,255,255)", 0.65: "rgb(0,255,0)", 0.95: "yellow", 1.0: "rgb(255,0,0)"});	// default is the common blue to red gradient
				this.set("opacity", parseInt(255/(100/config.opacity), 10) || 180);
				this.set("width", config.width || 0);
				this.set("height", config.height || 0);
                this.set("debug", config.debug);
		},
		init: function(){
				this.initColorPalette();
				var canvas = document.createElement("canvas"),
				acanvas = document.createElement("canvas"),
				element = this.get("element");
				this.set("canvas", canvas);
				this.set("acanvas", acanvas);
				canvas.width = acanvas.width = element.style.width.replace(/px/,"") || this.getWidth(element);
				this.set("width", canvas.width);
				canvas.height = acanvas.height = element.style.height.replace(/px/,"") || this.getHeight(element);
				this.set("height", canvas.height);
				canvas.style.position = acanvas.style.position = "absolute";
				canvas.style.top = acanvas.style.top = "0";
				canvas.style.left = acanvas.style.left = "0";
				canvas.style.zIndex = 1000000;
				if(!this.get("visible"))
					canvas.style.display = "none";

				this.get("element").appendChild(canvas);
                if(this.get("debug"))
                    document.body.appendChild(acanvas);
				this.set("ctx", canvas.getContext("2d"));
				this.set("actx", acanvas.getContext("2d"));
		},
		initColorPalette: function(){
				
			var canvas = document.createElement("canvas");
			canvas.width = "1";
			canvas.height = "256";
			var ctx = canvas.getContext("2d");
			var grad = ctx.createLinearGradient(0,0,1,256),
			gradient = this.get("gradient");
			for(var x in gradient){
				grad.addColorStop(x, gradient[x]);
			}
			
			ctx.fillStyle = grad;
			ctx.fillRect(0,0,1,256);
			
			this.set("gradient", ctx.getImageData(0,0,1,256).data);
			delete canvas;
			delete grad;
			delete ctx;
		},
		getWidth: function(element){
			var width = element.offsetWidth;
			if(element.style.paddingLeft)
				width+=element.style.paddingLeft;
			if(element.style.paddingRight)
				width+=element.style.paddingRight;
			
			return width;
		},
		getHeight: function(element){
			var height = element.offsetHeight;
			if(element.style.paddingTop)
				height+=element.style.paddingTop;
			if(element.style.paddingBottom)
				height+=element.style.paddingBottom;
			
			return height;
		},
		colorize: function(x, y){
				var width = this.get("width"),
				radiusOut = this.get("radiusOut"),
				height = this.get("height"),
				actx = this.get("actx"),
				ctx = this.get("ctx");
				
				var x2 = radiusOut*2;
				
				if(x+x2>width)
					x=width-x2;
				if(x<0)
					x=0;
				if(y<0)
					y=0;
				if(y+x2>height)
					y=height-x2;
				var image = actx.getImageData(x,y,x2,x2),
					imageData = image.data,
					length = imageData.length,
					palette = this.get("gradient"),
					opacity = this.get("opacity");
				for(var i=3; i < length; i+=4){
					var alpha = imageData[i],
					offset = alpha*4;
					
					if(!offset)
						continue;
					imageData[i-3]=palette[offset];
					imageData[i-2]=palette[offset+1];
					imageData[i-1]=palette[offset+2];
					imageData[i] = (alpha < opacity)?alpha:opacity;
				}
				image.data = imageData;
				ctx.putImageData(image,x,y);	
		},
		drawAlpha: function(x, y, count){
				var r1 = this.get("radiusIn"),
				r2 = this.get("radiusOut"),
				ctx = this.get("actx"),
				max = this.get("max"),
				rgr = ctx.createRadialGradient(x,y,r1,x,y,r2),
				xb = x-r2, yb = y-r2, mul = 2*r2;
				rgr.addColorStop(0, 'rgba(0,0,0,'+((count)?(count/this.store.max):'0.1')+')');  
				rgr.addColorStop(1, 'rgba(0,0,0,0)');
				ctx.fillStyle = rgr;  
				ctx.fillRect(xb,yb,mul,mul);
				this.colorize(xb,yb);

		},
		toggleDisplay: function(){
				var visible = this.get("visible"),
				canvas = this.get("canvas");
				
				if(!visible)
					canvas.style.display = "block";
				else
					canvas.style.display = "none";
					
				this.set("visible", !visible);
		},
		getImageData: function(){
				return this.get("canvas").toDataURL();
		},
		clear: function(){
			var w = this.get("width"),
			h = this.get("height");
			this.store.set("data",[]);
			this.get("ctx").clearRect(0,0,w,h);
			this.get("actx").clearRect(0,0,w,h);
		},
        cleanup: function(){
            this.get("element").removeChild(this.get("canvas"));
            delete this;
        }
	};
		
	return {
			create: function(config){
				return new heatmap(config);
			},
			util: {
				mousePosition: function(ev){
					var x, y;
					
					if (ev.layerX) { 
						x = ev.layerX;
						y = ev.layerY;
					} else if (ev.offsetX) { 
						x = ev.offsetX;
						y = ev.offsetY;
					}
					if(typeof(x)=='undefined')
						return;
					
					return [x,y];
				}
			}
		};
	})();
	w.h337 = w.heatmapFactory = heatmapFactory;
})(window);