// Import the cocos2d module
var cocos = require('cocos2d'),
// Import the geometry module
    geo = require('geometry');

var BioBlock = cocos.nodes.Node.extend({
	init: function() {
		BioBlock.superclass.init.call(this);
		
		var BioBlockSprite = cocos.nodes.Sprite.create({
			file: '/resources/heart.jpg',
			rect: new geo.Rect(0, 0, 87, 81)
		});
		BioBlockSprite.set('anchorPoint', new geo.Point(0, 0));
		this.addChild({child: BioBlockSprite});
		this.set('contentSize', BioBlockSprite.get('contentSize'));		
	}
});

exports.BioBlock = BioBlock;
