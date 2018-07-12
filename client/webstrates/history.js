'use strict';
const coreUtils = require('./coreUtils');
const coreEvents = require('./coreEvents');
const coreWebsocket = require('./coreWebsocket');
const globalObject = require('./globalObject');
const codeDatabase = require('./coreDatabase');
const coreJsonML = require('./coreJsonML');
const websocket = coreWebsocket.copy(event => event.data.startsWith('{"wa":'));
const webstrateId = coreUtils.getLocationObject().webstrateId;

/**
 * Returns latest version of the document
 * @param  {String}     webstrateId
 * @return {Number}     Latest version of the webstrate
 * @public
 */
globalObject.publicObject.getDocumentVersion = (webstrateId, callback) => {
    websocket.send({
        wa: 'getDocumentVersion',
        d: webstrateId,
    }, callback);
}

/**
 * Copy a webstrate into a new webstrate
 * @param  {String}     newWebstrateId      webstrateId of new document
 * @param  {String}     webstrateId         webstrateId of the webstrate being copied
 * @param  {Number}     version             version of the webstrate being copied
 * @return {null}
 * @public
 */
globalObject.publicObject.copyWebstrate = (newWebstrateId, webstrateId, version, callback) => {
    websocket.send({
        wa: 'copyWebstrate',
        d: webstrateId,
        n: newWebstrateId,
        v: Number(version)
    }, callback);
}


/**
 * Return timestamp value of a webstrate version
 * @param  {String}     webstrateId         webstrateId
 * @param  {Number}     version             version number of corresponding webstrate
 * @return {Number}                         returns the timestamp value of version
 * @public
 */
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

/**
 * Returns the version of webstrate before given timestamp
 * @param  {String}     webstrateId         webstrateId
 * @param  {Number}     timestamp           timestamp value
 * @return {Number}     version             version number before the timestamp value
 * @public
 */
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

/**
 * Returns all the operations for given webstrateId
 * @param  {String}     webstrateId     webstrateId
 * @return {obj} Object containing list of operations of a webstrate
 * @public
 */
 globalObject.publicObject.ops = (webstrateId, callback) => {
    websocket.send({
		wa: 'getOps',
        d: webstrateId,
        from: 0,
        to: undefined
	}, callback);
}

/**
 * Get all tags for a given webstrateId
 * @param  {String}     webstrateId     webstrateId
 * @return {obj} Object with tags, indexed by version number.
 * @public
 */
globalObject.publicObject.allTags = (webstrateId, callback) => {
	websocket.send({
		wa: 'allTags',
		d: webstrateId,
	}, callback);
}


/**
 * Get all copies of a webstrate
 * @param  {String}     webstrateId     webstrateId
 * @return {obj} Object containing list of webstrateId of copies
 * @public
 */
 globalObject.publicObject.getCopies = (webstrateId, callback) => {
    websocket.send({
        wa: 'getCopies',
        d: webstrateId,
    }, callback);
}

/**
 * Get all tags for a given webstrateId
 * @param  {String}     webstrateId     webstrateId
 * @param  {String}     label           tag label
 * @return {Number}     version         version to be tagged
 * @return {null}
 * @public
 */
globalObject.publicObject.tagById = (webstrateId, label, version, callback) => {
    websocket.send({
		wa: 'tag',
		d: webstrateId,
		v: Number(version),
		l: label
	}, callback);
}


/**
 * Get all tags for a given webstrateId
 * @param  {String}     webstrateId     webstrateId
 * @param  {String}     label           tag label
 * @return {HTML Object} HTML script of the webstrate.
 * @public
 */
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
