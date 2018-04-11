// ==UserScript==
// @name         Github profile show join date
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  show user created date in account profile
// @author       https://github.com/iMeiji
// @match        https://github.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const observer = new MutationObserver(main);
    let article = document.body;

    let options = {
        'subtree': true,
        'attributes': true
    };

    observer.observe(article, options);

    function main(){

        let el = document.getElementsByClassName('vcard-details border-top border-gray-light py-3')[0];
        if (el === undefined) {
            return;
        }
        let result = document.getElementsByClassName('join-date')[0];
        if (result !== undefined) {
            return;
        }
        let name = getName();
        let url = 'https://api.github.com/users/' + name;

        fetch(url).then(value => {
            return value.text();
        }).then(text => {
            let d = eval("(" + text + ")");
            return d["created_at"];
        }).then(c => {
            let p = parseTime(c);
            let h = createHtml(p);
            let e = htmlToElement(h);
            if (document.getElementsByClassName('join-date')[0] === undefined) {
                el.appendChild(e);
            }
        });
    }

    function getName() {
        let n = document.getElementsByClassName("p-nickname vcard-username d-block")[0];
        return n.innerHTML;
    }

    function parseTime(createTime) {
        let time = new Date(createTime);
        let options = {day: 'numeric', month: 'long', year: 'numeric'};
        options.timeZone = 'UTC';
        let t = new Intl.DateTimeFormat('en-US', options).format(time);
        console.log(t);
        return t;
    }

    let html = '<li aria-label="Member since" class="vcard-detail pt-1 css-truncate css-truncate-target"><svg aria-hidden="true" class="octicon octicon-clock" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M8 8h3v2H7c-.55 0-1-.45-1-1V4h2v4zM7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7z"></path></svg>\n' +
        '    <span class="join-label">Joined on </span>\n' +
        '    <local-time class="join-date" datetime="XXX" day="numeric" month="short" year="numeric" title=""></local-time>\n' +
        '</li>';

    function createHtml(time) {
        return html.replace('XXX', time);
    }

    function htmlToElement(html) {
        let template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

})();