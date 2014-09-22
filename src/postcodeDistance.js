chrome.extension.sendMessage(
    {
        type: 'state',
        url: window.location.href,
        tabId: ''
    },
    function(response) {
        if (response.isOn) {
            var detector = new PostcodeDetector();
            var $body = $('body');
            detector.lookupInElement($body);
        }
    }
);