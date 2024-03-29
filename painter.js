(function(){
var debug = 0;

var l = {
  distance : function(p1, p2){
    return Math.sqrt( Math.pow(p2[1] - p1[1], 2) + Math.pow(p2[0] - p1[0], 2) )           
  }
}

function updateKeyState(e, keys){
  var state = (e.type === "keydown"),
      idx = (e.keyCode === 32 ? 4 : e.keyCode - 37);
  keys[idx] = state;
  return keys;
}

function createPlayer(keys, properties, dropPaint){
  var p = properties,
      charge = 0,
      ammo = loop.animations.particle(
          function(){},
          function(now, width, height){
            return [
              p.x ,
              p.y ,
              now + 300 + Math.random() * 200,
              Math.cos(p.theta + Math.random()*0.1) * 5,
              Math.sin(p.theta + Math.random()*0.1) * 5,
              now,
              dropPaint
            ];
          },
          function(p){
            return p;
          },
          "lighter",
          "#11F",
          8, 
          dropPaint 
        );
  loop.registerAnimation(ammo);
  return {
    animate:function(time, w, h){
      var dx = 0,
          dy = 0;
      if(keys[0]) {
        p.theta = (p.theta - Math.PI/30) % (Math.PI * 2)
        console.log(p.theta)
      }
      if(keys[2]){
        p.theta = (p.theta + Math.PI/30) % (Math.PI * 2)
        console.log(p.theta)
      }
      if(keys[1]) {
        dx += Math.cos(p.theta) * 3 
        dy += Math.sin(p.theta) * 3
      }
      if(keys[3]) {
        dx -= Math.cos(p.theta) * 3
        dy -= Math.sin(p.theta) * 3
      }

      p.x += dx;
      p.y += dy;

      if(keys[4]){
        if(charge>50){
          ammo.create(300);
          charge=0;
        }else{
          charge++;
        }
      }
      else{
        ammo.create(charge * 5);
        charge = 0;
      }

      return true
    },
    render:function(ctx, w, h){
      ctx.globalCompositeOperation="source-over";
      ctx.fillStyle="hsl(0, 100%, "+ (50 + charge) + "%)";
      ctx.translate(p.x, p.y);
      ctx.rotate(p.theta);
      ctx.fillRect(-10, -10, 20, 20);
      ctx.rotate(-p.theta);
      ctx.translate(-p.x, -p.y);
    }
  };
}

function createCleaner(properties, cleanPaint){
  var p = properties,
      lastPos = [p.x, p.y],
      target = [p.x, p.y],
      rotation = 0;
  return {
    animate:function(time, w, h){
      var dx = 0,
          dy = 0;
      
      var distanceTarget = this.distanceTarget(p, target);
      if(distanceTarget < 10){
        target = [Math.random() * w, Math.random() * h]; 
      }

      this.updateTheta2(p, target);

      dx = Math.cos(p.theta) * 3;
      dy = Math.sin(p.theta) * 3;
      
      p.x += dx;
      p.y += dy;

      cleanPaint([p.x, p.y]);

      return true
    },
    render:function(ctx, w, h){
      ctx.globalCompositeOperation="source-over";
      ctx.fillStyle="hsl(100, 100%, 50%)";
      ctx.translate(p.x, p.y);
      ctx.rotate(p.theta);
      ctx.fillRect(-10, -10, 20, 20);
      ctx.rotate(-p.theta);
      ctx.translate(-p.x, -p.y);
      if(debug){
        ctx.fillStyle="#DDD";
        ctx.fillRect(target[0]-5, target[1]-5, 10,10);
      }
    },
    distanceTarget : function(p, target){
      return l.distance(target, [p.x, p.y]);
    },
    updateTheta : function(p, target){

      if( p.x < target[0] + 5 && target[0] -5 < p.x){
        if(target[1] > p.y ){
          p.theta = Math.PI/2;
        }
        else{
          p.theta = 3*Math.PI/2;
        }
      }
      else if(target[0] < p.x){
        p.theta = Math.PI;
      }
      else {
        p.theta = 0;
      }
      return p;
    },
    updateTheta2 : function(p, target){
      var targetP = [target[0] - p.x, target[1] - p.y];
      p.theta = Math.atan2(targetP[1] , targetP[0]);
      return p;
    }
  };
}

function play(){
  var keys = 
          [ 0,  //left
            0,  //up
            0,  //right
            0,  //down
            0 ], //ctrl
      pause = false,
      keyCallback = function(e){
        updateKeyState(e, keys);
      };

  document.addEventListener("keydown",keyCallback, true);
  document.addEventListener("keyup",keyCallback, true);

  var playground = (function(){
        var c = document.createElement("canvas");
        c.height = window.datastore["CANVAS_HEIGHT"];
        c.width = window.datastore["CANVAS_WIDTH"];
        return c;
      })(),
      playgroundCtx = playground.getContext("2d"), 
      dropPaint = function(p){
        playgroundCtx.fillStyle = "blue";
        playgroundCtx.fillRect(p[0], p[1], 5, 5);
      },
      cleanPaint = function(p){
        playgroundCtx.clearRect(p[0] -10, p[1] -10, 20 , 20);
      }, 
      mainLoop = {
        _init : function(w, h){
          loop.registerAnimation(createPlayer(keys, {
            x: w/2,
            y: h/2,
            theta : 0
          }, dropPaint));
          loop.registerAnimation(createCleaner( {
            x: 50,
            y: 50,
            theta : Math.PI 
          }, cleanPaint))
          loop.registerAnimation(createCleaner( {
            x: w/2 - 50,
            y: h/2 + 50,
            theta : Math.PI/2
          }, cleanPaint))
          loop.registerAnimation(createCleaner( {
            x: w/2 + 50,
            y: h/2 - 50,
            theta : 3 * Math.PI/2
          }, cleanPaint))
          loop.registerAnimation(createCleaner( {
            x: w/2 - 50,
            y: h/2 - 50,
            theta : 0
          }, cleanPaint))
        },
        animate : function(){
          return true;
        },
        render: function(ctx, width, height){
          ctx.globalCompositeOperation="source-over";
          ctx.drawImage(playground, 0, 0, width, height);
        }
      }

  window.loop.registerAnimation(mainLoop);

  window.loop.start()
};

play();
})();
