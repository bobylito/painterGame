//Experience 1 : playing with canvas
(function(){

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
      var t = (time||20)/10,
          dx = 0,
          dy = 0;
      if(keys[0]) p.theta -= Math.PI/30
      if(keys[2]) p.theta += Math.PI/30
      if(keys[1]) {
        dx += Math.cos(p.theta) * 3 
        dy += Math.sin(p.theta) * 3
      }
      if(keys[3]) {
        dx -= Math.cos(p.theta)
        dy -= Math.sin(p.theta)
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
      mainLoop = {
        _init : function(w, h){
          loop.registerAnimation(createPlayer(keys, {
            x: w/2,
            y: h/2,
            theta : 0
          }, dropPaint))
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
