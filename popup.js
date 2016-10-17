
window.onload=function() {
  document.getElementById("ss").onclick = function send_msg() {
    chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  });
  }
}
