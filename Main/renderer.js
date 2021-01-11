const ipc = require('electron').ipcRenderer;
// ipc.send('hello', 'a string', 10);

function getCSS(element) {
    var css_data = '';
    var css_obj = getComputedStyle(element);

    for (var i = 0; i < css_obj.length; i++) {
        css_data +=
            css_obj[i] + ':' +
            css_obj.getPropertyValue(css_obj[i])
            + ';<br>';
    }
    // document.getElementsByTagName('body')[0].innerHTML = css_data;
    return css_data;
}

setInterval(() => {
    if (document.querySelector('#GoButton')) {
        if (document.querySelector('#GoButton').innerText == "Loading...") {
            ipc.send('raceLink', "Received click. LINK: " + "https://play.typeracer.com?rt=" + document.querySelector("#RaceId").value);
        }
        // button = document.querySelector('button').innerHTML
    } else {
        body = document.querySelector('body').innerHTML;
        ipc.send('getHTML', body);
        ipc.send('getBodyCSS', getCSS(document.getElementsByTagName("body")[0]));
    }
}, 1000)