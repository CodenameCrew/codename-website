(()=>{"use strict";var e=[document.getElementById("last-updated")];e.length>0&&window.Intl&&e.forEach((e=>{var t=e.getAttribute("data-time");e.innerText=((e,t="en")=>{const n="number"==typeof e?e:e.getTime(),a=Math.round((n-Date.now())/1e3),r=[60,3600,86400,604800,2592e3,31536e3,1/0],o=r.findIndex((e=>e>Math.abs(a))),d=o?r[o-1]:1;return new Intl.RelativeTimeFormat(t,{numeric:"auto"}).format(Math.floor(a/d),["second","minute","hour","day","week","month","year"][o])})(new Date(t))}))})();