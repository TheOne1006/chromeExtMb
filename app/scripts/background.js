'use strict';


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
