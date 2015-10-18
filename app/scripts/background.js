'use strict';


/**
 * 数据存储Server
 */
function mbDataServer () {
  
  var _cache = {
    'mbList' : [],
    'dirList' : []
  },
  needCheck = false;

  function _getAll ( next) {
    chrome.storage.local.get('bmIdArr', function(dataObj) {
        _cache.mbList = dataObj.bmIdArr || [];

        next(_cache.mbList);
    });
  }

  function _getId (id, next) {
    chrome.storage.local.get(id, function(dataObj) {
        next(dataObj[id]);
    });
  }


  return {
    getAll: function(next){
      if(needCheck || _cache.mbList.length === 0) {
        _getAll(next);
      }else {
        next(_cache.mbList);
      }
    },
    getId: function(id, next){
      if(id && _.isString(id)){
        _getId(id, next);
      }else {
        next();
      }
    },
    checkNext: function() {
        needCheck = true;
    }

  };

}


/**
 * visitServer
 */
function visitServer () {
  var _cache = {
    hostNameList: [],
    hrefList: []
  };

  var defaluteUrl = {
    url:'',
    visitCount:1,
    liveTime:0
  };

  /**
   * 初始化
   */
  chrome.storage.local.get('hrefList', function(data){
    _cache.hrefList = data.hrefList;
  });

  chrome.storage.local.get('hostNameList', function(data){
    _cache.hostNameList = data.hostNameList;
  });


  return {
    addVisit: function(url){
      chrome.storage.local.get(url,function(data){
        var tmpObj = {}, urlData = {};

        if(data[url]){
          urlData = _.extend(defaluteUrl,data[url]);
          urlData.visitCount += 1;
        }else {
          urlData = _.extend({},defaluteUrl,{url:url});
        }

        tmpObj[url] = urlData;

        chrome.storage.local.set(tmpObj);

      });
    },
    push: function(data){
      if(data && data.href){
        if(_.indexOf(_cache.hrefList, data.href === -1)){
          _cache.hrefList.push(data.href);

           chrome.storage.local.set({'hrefList':_cache.hrefList});
        }
      }else if(data.hostName){
        if(_.indexOf(_cache.hrefList, data.hostName === -1)){
          _cache.hostNameList.push(data.hostName);

          chrome.storage.local.set({'hostNameList':_cache.hostNameList});
        }
      }
    },
    getFromHostName: function(){

    },
    getFromHref: function(){

    }

  };
}


var _mbserver = mbDataServer(),
_listenServer,
_visitServer = visitServer();
/**
 * 处理监听返回事件
 */

_listenServer = (function(){

  return {
    getAll:function(data, sendResponse){
      _mbserver.getAll(function(data){
          // console.log(data);
          sendResponse(data);
      });
    },
    statisticalUrl: function(data) {
      var href = data.href || '',
        hostName = data.hostName;

      _visitServer.addVisit(href);
      _visitServer.addVisit(hostName);

      _visitServer.push(data);

    }

  };

})();

/**
 * 监听
 * message = {
 *   "action": action,
 *   "data": data
 * }
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  var actionName = (message && message.action) || '',
  data = message.data;

  if(_listenServer.hasOwnProperty(actionName)) {

    _listenServer[actionName](data, sendResponse);
  }else {
    sendResponse();
  }
});








function bookMarkSchema ( bookObj) {
  var defaultOptions = {
    'id':'0',
    'parentId':'0',
    'title':'',
    'url':'',
    'tags':[],
    'weight':0,
    'visitsCount':0,
    'startTime':0,
    'isDir':false
  };

  return _.extend({},defaultOptions, bookObj);

}

function foreachArrayAndGetMark ( arr, bookmarkArray) {
  var len = 0,
  i,j,
  arrChildren = [],
  delayForeachMarksArray = [];

  if(arr && arr.length) {
    len = arr.length;
    for (i = len - 1; i >= 0; i--) {
      // 初始化
      arrChildren = [];
      if(arr[i] && arr[i].children) {
        for (j = arr[i].children.length - 1; j >= 0; j--) {
          bookmarkArray.push(bookMarkSchema({
            'id':arr[i].children[j].id,
            'parentId': arr[i].children[j].parentId,
            'title':arr[i].children[j].title,
            'url': arr[i].children[j].url || '',
            'startTime': Date.now(),
            'isDir': (arr[i].children[j].children)? true: false
          }));

          if(arr[i].children[j].children && arr[i].children[j].children.length) {
            delayForeachMarksArray.push(arr[i].children[j]);
          }
        }
      }
    }

    if(delayForeachMarksArray.length) {
      foreachArrayAndGetMark(delayForeachMarksArray, bookmarkArray);
    }
  }
}

function getAllbookmarksInfo ( bookmarkArray) {

  var allBookmark = [];

  if(bookmarkArray ) {
    foreachArrayAndGetMark( bookmarkArray, allBookmark);
  }

  return allBookmark;
}

/**
 * 缓存工具函数
 */
// function storageClearAll ( next ) {
//   chrome.storage.local.clear( next);
// }


// 监听事件, 初始化
chrome.runtime.onInstalled.addListener(function () {
  var i,
  singleMark,
  dirIdArr = [],
  bmIdArr = [],
  tmpObj;

  chrome.bookmarks.getTree(function( bookmarkArray) {
    // console.log(bookmarkArray);
    var allmarks = getAllbookmarksInfo(bookmarkArray);
    // console.log(allmarks);


    // 录入缓存, 初始化
    i = allmarks.length -1 ;
    for (; i >= 0; i--) {
      singleMark = allmarks[i];

      if(singleMark.isDir) {
        dirIdArr.push(singleMark);
      }else {
        bmIdArr.push(singleMark);
      }

      tmpObj = {};
      tmpObj[singleMark.id] = singleMark;
      chrome.storage.local.set(tmpObj);
    }

    if(dirIdArr.length) {
      chrome.storage.local.set({'dirIdArr':dirIdArr});
    }

    if(bmIdArr.length) {
      chrome.storage.local.set({'bmIdArr':bmIdArr});
    }

  });
});



/**
 * omnbox
 */


chrome.omnibox.setDefaultSuggestion({'description':'搜索书签'});

chrome.omnibox.onInputChanged.addListener(function(text, suggest){
  suggest([{
      'content': 'title'+text,
      'description': '搜索:'+text
  }]);

});
