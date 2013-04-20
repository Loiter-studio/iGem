// Import the cocos2d module
var cocos = require('cocos2d'),
// Import the geometry module
    geo = require('geometry');

// Import the bioblock module
var BioBlock = require('BioBlock').BioBlock;
	
// Create a new layer
var Breakout = cocos.nodes.Layer.extend({
	bioblock: null,

    init: function() {
		// You must always call the super class version of init
        Breakout.superclass.init.call(this);
		
		this.set('isMouseEnabled', true);
	
		//add bioblock
		var bioblock = BioBlock.create();
		bioblock.set('position', new geo.Point(160, 280));
		this.addChild({child: bioblock});
		this.set('bioblock', bioblock);
    },
	
	mouseDragged: function(ev) {
		var bioblock = this.get('bioblock');
		var bioblockPos = bioblock.get('position');
		bioblockPos.x = ev.locationInCanvas.x;
		bioblockPos.y = ev.locationInCanvas.y;
		bioblock.set('position', bioblockPos);
	}
});

exports.main = function() {
    // Initialise application

    // Get director
    var director = cocos.Director.get('sharedDirector');

    // Attach director to our <div> element
    director.attachInView(document.getElementById('breakout_app'));

    // Create a scene
    var scene = cocos.nodes.Scene.create();
	
    // Add our layer to the scene
    scene.addChild({child: Breakout.create()});

    // Run the scene
    director.runWithScene(scene);
};
