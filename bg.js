var url_list=[
  "https://www.google.com",
  "https://maps.google.com",
  "https://www.digitalocean.com",
  "https://www.microsoft.com",
  "https://www.apple.com",
  "https://www.android.com",
  "https://www.facebook.com",
  "https://www.twitter.com",
  "https://news.google.com",
  "http://www.w3school.com.cn",
  "https://www.hku.hk",
  "http://www.cs.hku.hk"];
var update_url_list=[
  "https://www.digitalocean.com",
  "https://www.microsoft.com",
  "https://www.apple.com",
  "https://www.android.com",
  "https://www.facebook.com",
  "https://www.twitter.com",
  "https://news.google.com",
  "http://www.w3school.com.cn",
  "https://www.hku.hk",
  "http://www.cs.hku.hk",
  "https://www.google.com",
  "https://maps.google.com"];
var now = 0;
var now_switch = 0;
var now_update = 0;
var tab_list = [];
var selected_tab = -1;
var ended = false;
function new_tab(url) {
  chrome.tabs.create({url:url, active:false});
}

function switch_tab(tab) {
  chrome.tabs.update(selected_tab, {highlighted:false, active:false});
  chrome.tabs.update(tab, {highlighted:true, active:true});
}

function update_tab(tab, url) {
  chrome.tabs.update(selected_tab, {highlighted:false, active:false});
  chrome.tabs.update(tab, {highlighted:true, active:true, url:url});
}

function start_benchmark() {
  window.console.log("started");
  var creating_time = 500;
  var switching_time = url_list.length*800;
  var updating_time = url_list.length*800;
  var deleting_time = url_list.length*600;
  chrome.alarms.create("creating", {when:Date.now()+500});
  chrome.alarms.create("switching", {when:Date.now()+switching_time});
  chrome.alarms.create("updating", {when:Date.now()+switching_time+updating_time});
  chrome.alarms.create("deleting", {when:Date.now()+switching_time+updating_time+deleting_time});
}

function update_tab_list() {
  chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(ta){
    for (var i = 0;i < ta.length;i++) {
      tab_list[i] = ta[i].id;
      if(ta[i].highlighted == true) {
        selected_tab=ta[i].id;
      }
    }
  });
}

chrome.alarms.onAlarm.addListener(function callback(alarm) {
  if (alarm.name == "creating") {
    new_tab(url_list[now]);
    now=now+1;
    if (now < url_list.length){
      chrome.alarms.create("creating", {when:Date.now()+1000})
    }
  } else if (alarm.name == "switching") {
    if (tab_list.length == 0) {
      update_tab_list();
    }
    if (tab_list.length == 0) {
      chrome.alarms.create("switching", {when:Date.now()+500});
      return;
    }
    switch_tab(tab_list[now_switch]);
    now_switch=now_switch+1;
    if (now_switch < tab_list.length) {
      chrome.alarms.create("switching", {when:Date.now()+500});
    }
  } else if (alarm.name == "updating") {
    while(now_update < url_list.length) {
      if (now_update % 2 == 0) {
        update_tab(tab_list[now_update], update_url_list[now_update]);
        now_update=now_update+1;
        chrome.alarms.create("updating", {when:Date.now()+500});
        break;
      } else {
        now_update=now_update+1;
      }
    }
  } else if(alarm.name == "deleting") {
    chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(ta){
      for (var i = 0;i < ta.length;i++) {
        tab_list[i] = ta[i].id;
        if(ta[i].highlighted == true) {
          selected_tab=ta[i].id;
        }
      }
      chrome.tabs.remove(tab_list);
    });
  }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting=="hello"){
      start_benchmark();
      sendResponse({farewell:"goodbye"});
    }
  }
);
