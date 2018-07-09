'use strict';
const coreUtils = require('./coreUtils');
const coreEvents = require('./coreEvents');
const coreWebsocket = require('./coreWebsocket');
const globalObject = require('./globalObject');
const codeDatabase = require('./coreDatabase');
const coreJsonML = require('./coreJsonML');
const websocket = coreWebsocket.copy(event => event.data.startsWith('{"wa":'));
const webstrateId = coreUtils.getLocationObject().webstrateId;

// returns latest version of the document
globalObject.publicObject.getDocumentVersion = (webstrateId, callback) => {
    websocket.send({
        wa: 'getDocumentVersion',
        d: webstrateId,
    }, callback);
}

// Create a new document for a given webstrateId
globalObject.publicObject.copyWebstrate = (newWebstrateId, webstrateId, version, callback) => {
    websocket.send({
        wa: 'copyWebstrate',
        d: webstrateId,
        n: newWebstrateId,
        v: Number(version)
    }, callback);
}

globalObject.publicObject.getVersionTimestamp = (webstrateId, version, callback) => {
    if(!version){
        return callback(null, new Date().getTime());
    }

    globalObject.publicObject.getDocumentVersion(webstrateId, (err, latestVersion) => {
        if(version >= latestVersion){
            return callback(err, new Date().getTime());
        }

        websocket.send({
            wa: 'getVersionTimestamp',
            d: webstrateId,
            v: Number(version)
        }, callback);
    })
}

globalObject.publicObject.getVersionBeforeTimestamp = (webstrateId, timestamp, callback) => {
    websocket.send({
        wa: 'getVersionBeforeTimestamp',
        d: webstrateId,
        t: Number(timestamp)
    }, function(err, version){
        globalObject.publicObject.getDocumentVersion(webstrateId, function(err, latestVersion){
            if(version >= latestVersion){
                return callback(err, latestVersion);
            }
            return callback(err, version + 1);
        });
    });


}

// Returns all the operations on a given webstrate
globalObject.publicObject.ops = (webstrateId, callback) => {
    websocket.send({
		wa: 'getOps',
        d: webstrateId,
        from: 0,
        to: undefined
	}, callback);
}

/**
 * Get a object of all tags for a given webstrateId
 * @return {obj} Object with tags, indexed by version number.
 * @public
 */
globalObject.publicObject.allTags = (webstrateId, callback) => {
	websocket.send({
		wa: 'allTags',
		d: webstrateId,
	}, callback);
}


// Returns all the copies of the webstrate using its metadata
globalObject.publicObject.getCopies = (webstrateId, callback) => {
    websocket.send({
        wa: 'getCopies',
        d: webstrateId,
    }, callback);
}

globalObject.publicObject.tagById = (webstrateId, label, version, callback) => {
    websocket.send({
		wa: 'tag',
		d: webstrateId,
		v: Number(version),
		l: label
	}, callback);
}


// returns raw html of a webstrate for a given version
globalObject.publicObject.getHTML = (webstrateId, version, callback) => {
    websocket.send({
        wa: 'fetchdoc',
        d: webstrateId,
        v: Number(version)
    }, (err, data) => {
        if(err){
            console.log(err);
        }
        return callback(err, coreJsonML.toHTML(data.data));
    });
}
