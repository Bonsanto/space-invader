navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
if (navigator.vibrate) {
	var bulletImpactVibration = function () {
		navigator.vibrate(250);
	};
	var cityImpactVibration = function () {
		navigator.vibrate(100);
	};
	var loseVibration = function () {
		navigator.vibrate([600, 100, 400, 100, 400]);
	};
	var winVibration = function () {
		navigator.vibrate(1250);
	};
}