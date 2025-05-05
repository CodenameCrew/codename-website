(function() {

/**@__PURE__*/
function minimizeCss( content ) {
	content = content.trim();
	content = content.replace( /\n/g, '' );
	content = content.replace( /\t/g, '' );
	// sadly i cant include more optimizations since minification wont pre run the replacements
	return content;
}

/*

// Cause a whole new rendering layer
transform: translateZ(0px);
will-change: transform;
*/
var styleCss = minimizeCss(`
.countdown-container {
	display: flex;
	flex-direction: row;
	justify-content: center;

	font-size: 2em;
	height: 1.2em;
}

.end-container {
	display: flex;
	flex-direction: row;
	justify-content: center;

	margin-top: 1em;

	font-size: 1em;
	height: 1.2em;
}

.days, .hours, .minutes, .seconds {
	display: flex;
	flex-direction: row;
	justify-content: center;

	overflow: hidden;
}

.digit-group {
	display: flex;
	flex-direction: row;
	justify-content: center;

	background-color: var(--primary-color);
	box-shadow: 0 0 0 2px rgba(0, 0, 0, .2) inset;

	transform: translateZ(0px);
	will-change: transform;
}

.digits {
	display: flex;
	flex-direction: column;
	transition: transform 0.3s;
}

.digit {
	width: 1.2em;
	height: 1.5em;
	color: white;
	display: flex;
	justify-content: center;
	align-items: center;
}

.spacing {
	margin-top: 0.8em;
	font-size: 0.6em;
	margin-left: 0.2em;
	margin-right: 0.6em;
}

.countdown-container.finished {
	position: relative;
}

.countdown-container.finished .days, .countdown-container.finished .hours, .countdown-container.finished .minutes, .countdown-container.finished .seconds {
	opacity: 0.25;
}

.countdown-container.finished::after {
	content: attr(data-message);
	font-size: 1.5em;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;

	pointer-events: none;
}

.invalid-date {
	color: red;
}

`);

function $$(tagName, attrs, children) {
	var el = document.createElement(tagName);
	if(attrs) {
		for(const attr in attrs) {
			var value = attrs[attr];
			if(attr == "className") {
				var classes = value.split(" ");
				for(const className of classes) {
					el.classList.add(className);
				}
			} else {
				if(typeof value == "function") {
					el[attr] = value;
				} else {
					el.setAttribute(attr, attrs[attr]);
				}
			}
		}
	}
	if(children) {
		for(let child of children) {
			if(typeof child == "string") {
				child = document.createTextNode(child);
			}
			el.appendChild(child);
		}
	}
	return el;
}

var floor = Math.floor;

/**@__PURE__*/
function getTimeDiffArr(diff) {
	if (diff <= 0) {
		return [0, 0, 0, 0];
	}

	const days = floor(diff / (1000 * 60 * 60 * 24));
	const hours = floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = floor((diff % (1000 * 60)) / 1000);

	return [days, hours, minutes, seconds];
}

const DAYS = 0;
const HOURS = 1;
const MINUTES = 2;
const SECONDS = 3;

const maxDigitFirst = [10, 3, 6, 6];

class CountdownTimer extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });

		const style = document.createElement("style");
		style.textContent = styleCss;
		this.shadowRoot.appendChild(style);

		let time = this.getTime();

		console.log(time);
		this.days = this.createDigitsFor(DAYS, 3);
		this.hours = this.createDigitsFor(HOURS);
		this.minutes = this.createDigitsFor(MINUTES);
		this.seconds = this.createDigitsFor(SECONDS);

		let container = document.createElement("div");
		container.classList.add("countdown-container");
		if(time == null) {
			container.setAttribute("data-message", this.getAttribute("data-date") == "awaiting-date" ? "Awaiting Date" : "Invalid Date");
			container.classList.add("finished");
		} else {
			container.setAttribute("data-message", this.getAttribute("data-message") ?? "! Awaiting Deletion !");
		}
		if(this.finished) {
			container.classList.add("finished");
		}

		container.appendChild($$("div", {"className": "days"}, [
			$$("div", {"className": "digit-group"}, this.days),
			this.createSpacing("d")
		]));

		container.appendChild($$("div", {"className": "hours"}, [
			$$("div", {"className": "digit-group"}, this.hours),
			this.createSpacing("h")
		]));

		container.appendChild($$("div", {"className": "minutes"}, [
			$$("div", {"className": "digit-group"}, this.minutes),
			this.createSpacing("m")
		]));

		container.appendChild($$("div", {"className": "seconds"}, [
			$$("div", {"className": "digit-group"}, this.seconds),
			this.createSpacing("s")
		]));

		this.shadowRoot.appendChild(container);

		if (time != null) {
			let timeSinceEnd = Date.now() - this.getEndTimeObj().getTime();
			if (timeSinceEnd < 0) {
				timeSinceEnd = 0;
			}

			if (timeSinceEnd > 0) {
				let text = document.createElement("div");
				text.classList.add("end-container");

				let readableTime = [];

				const msInYear = 1000 * 60 * 60 * 24 * 365;
				const msInMonth = 1000 * 60 * 60 * 24 * 30;
				const msInDay = 1000 * 60 * 60 * 24;
				const msInHour = 1000 * 60 * 60;
				const msInMinute = 1000 * 60;
				const msInSecond = 1000;

				let hasAdded = false;

				if (hasAdded || timeSinceEnd >= msInYear) {
					const years = Math.floor(timeSinceEnd / msInYear);
					readableTime.push(`${years}y`);
					timeSinceEnd -= years * msInYear;
					hasAdded = true
				}

				if (hasAdded || timeSinceEnd >= msInMonth) {
					const months = Math.floor(timeSinceEnd / msInMonth);
					readableTime.push(`${months}mo`);
					timeSinceEnd -= months * msInMonth;
					hasAdded = true;
				}

				if (hasAdded || timeSinceEnd >= msInDay) {
					const days = Math.floor(timeSinceEnd / msInDay);
					readableTime.push(`${days}d`);
					timeSinceEnd -= days * msInDay;
					hasAdded = true;
				}

				if (hasAdded || timeSinceEnd >= msInHour) {
					const hours = Math.floor(timeSinceEnd / msInHour);
					readableTime.push(`${hours}h`);
					timeSinceEnd -= hours * msInHour;
					hasAdded = true;
				}

				if (hasAdded || timeSinceEnd >= msInMinute) {
					const minutes = Math.floor(timeSinceEnd / msInMinute);
					readableTime.push(`${minutes}m`);
					timeSinceEnd -= minutes * msInMinute;
					hasAdded = true;
				}

				if (hasAdded || timeSinceEnd >= msInSecond) {
					const seconds = Math.floor(timeSinceEnd / msInSecond);
					readableTime.push(`${seconds}s`);
					hasAdded = true;
				}

				readableTime = readableTime.slice(0, 3);

				text.textContent = `Countdown ended: ${readableTime.join(" ")} ago`;
				this.shadowRoot.appendChild(text);
			}
		}


		//this.debug = document.createElement("div");
		//this.debug.classList.add("debug");
		//this.shadowRoot.appendChild(this.debug);
	}

	createDigitsFor(type, totalDigits=2) {
		let maxFirst = maxDigitFirst[type];

		let digits = [];

		//var currentTime = time[["days", "hours", "minutes", "seconds"].indexOf(type)];

		for(let i = 0; i < totalDigits; i++) {
			if(this.finished) {
				digits.push(this.createDigits(1));
			} else {
				digits.push(this.createDigits(i == 0 ? maxFirst : 10));
			}
		}
		return digits;
	}

	getEndTimeObj() {
		const dateString = this.getAttribute("data-date");
		let date = new Date(dateString);
		if(!isNaN(date.getTime())) {
			return date;
		}
		if (/^[0-9]+$/.test(dateString) && !isNaN(parseInt(dateString, 10))) {
			const timestamp = parseInt(dateString, 10);
			// Yes i know its not a smart idea to check the length of the string,
			// in the distant future when it breaks i will fix this, if im still alive
			// This breaks after 2286-11-20
			return new Date(dateString.length === 10 ? timestamp * 1000 : timestamp);
		}

		return null;
	}

	getTime() {
		const date = this.getEndTimeObj();
		if(date == null) {
			return null;
		}

		const now = new Date();
		const diff = date.getTime() - now.getTime();

		this.finished = diff <= 0;
		return getTimeDiffArr(diff);
	}

	createSpacing(text) {
		let container = document.createElement("div");
		container.classList.add("spacing");
		container.textContent = text;
		return container;
	}
	// if input is 5 then it returns [0, 1, 2, 3, 4]
	createDigits(num) {
		const digitsInt = [];
		for(let i = 0; i < num; i++) {
			digitsInt.push(i);
		}
		let digits = [];
		let container = document.createElement("div");
		container.classList.add("digits");
		for(const digit of digitsInt) {
			digits.push(document.createElement("div"));
			digits[digit].classList.add("digit");
			digits[digit].textContent = digit;
			container.appendChild(digits[digit]);
		}
		return container;
	}

	getDigits(num) {
		var digits = [];
		while(num > 0) {
			digits.push(num % 10);
			num = floor(num / 10);
		}
		return digits.reverse();
	}

	connectedCallback() {
		if(this.finished) {
			return;
		}
		const date = this.getEndTimeObj();

		const setDigits = (digitsElm, numberToSet, length=2) => {
			let digits = this.getDigits(numberToSet);
			while(digits.length < length) {
				digits.unshift(0);
			}

			var i = 0;
			for(const digit of digitsElm) {
				// more optimized to use translateY, since it doesn't have to repaint the whole element
				//digit.style.marginTop = "-" + (digits[i]*2.375/2) + "em";
				digit.style.transform = `translateY(-${digits[i]*(2.375/2)}em)`;
				i++;
			}
		}

		const updateCountdown = () => {
			const now = new Date();
			const diff = date.getTime() - now.getTime();

			if (diff < 0) {
				diff = 0;

				clearInterval(this.interval);
				this.container.classList.add("finished");
				this.finished = true;
			}

			const diffs = getTimeDiffArr(diff);

			setDigits(this.days, diffs[DAYS], 3);
			setDigits(this.hours, diffs[HOURS]);
			setDigits(this.minutes, diffs[MINUTES]);
			setDigits(this.seconds, diffs[SECONDS]);

			//this.debug.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
		};

		updateCountdown();
		this.interval = setInterval(updateCountdown, 1000);
	}
}

customElements.define("countdown-timer", CountdownTimer);

})();
