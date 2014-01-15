 
/**
 * Utility dependencies
 */
var request = require('request');
var zlib = require('zlib');
//var JSON2 = require('JSON2');
/**
 * Expose adapter utility functions
 */

var utils = {
	getStackDateString: function(convertThis){
			if (convertThis){
				var theTime = convertThis.toString();
			} else {
				var theTime = new Date().getTime().toString();
			}
			// Stack hates milliseconds so we must chop them off
		var stackDate = Number(theTime.substr(0,theTime.length-3));
		return stackDate;
		},
	callStack: function(thisPoll,url,cb){
//		console.log('Making Request to url:'+url+' with method:'+thisPoll.requestMethod);

		var soBuff = [];
		var gunzip = zlib.createGunzip();
		request({method:thisPoll.requestMethod,url:url}).pipe(gunzip);

		gunzip.on('data', function(data) {
		    soBuff.push(data.toString());
		}).on('end', function() {
			utils.parseStackMessage(thisPoll,soBuff.join(""))
		}).on('error', function(e) {
		   return thisPoll.stackItemCB(e);
		})

	},

	// Post Stack data to URL specified in config/adapters.js
	makeRequest: function(requestURL,requestMethod,params){
		request({url: requestURL,
			form: params
		});
	},

	// Convert the ungzipped string of JSON into javascript then 'post' each item to the callback URL
	parseStackMessage: function(thisPoll,stackItemArray){
//		console.log('Parsing JSON string of length '+stackItemArray.length);
		try{

			var itsJSnow = JSON.parse(stackItemArray);
//			console.log('Sending '+itsJSnow.items.length+' parsed items to final callback.');
	  		return thisPoll.stackItemCB(null,itsJSnow.items);
		} catch(err) {
			console.log('Your JSON is broken: '+err);
	  		return thisPoll.stackItemCB(err);
		}

	}
};
module.exports = utils;
