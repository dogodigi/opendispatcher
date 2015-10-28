function historyControl() {
  ol.Object.call(this);
}

ol.inherits(historyControl, ol.Object, ol.Observable_dispatchEvent);

historyControl.prototype.addMapListeners = function() {
  var map = this.get('map');
  var _this = this;
  map.on('moveend', function(e) {
    var currentHistory = _this.get('history');
    currentHistory.push({
      zoom: map.getView().getZoom(),
      center: map.getView().getCenter(),
      rotation: map.getView().getRotation()
    });
    _this.set('history', currentHistory);
  });
  this.on('change:history', function(e) {
    this.updateDisabled();
  });
};
historyControl.prototype.updateDisabled = function() {
  console.log('history changed');
  console.log(this.get('history'));
  console.log(this.get('history').length === 0);
  console.log(this.get('future').length === 0);
  var backDisabled = (this.get('history').length === 0);
  var forwardDisabled = (this.get('future').length !== 0);
  if (backDisabled !== this.get('backDisabled')) {
    this.set('backDisabled', backDisabled);
  }
  if (forwardDisabled !== this.get('forwardDisabled')) {
    this.set('forwardDisabled', backDisabled);
  }
};
historyControl.prototype.setMap = function(map) {
  console.log(this.constructor.name + ': Setting map...');
  this.set('map', map);
  console.log(this.constructor.name + ': Setting history...');
  this.set('history', []);
  this.set('future', []);
  this.set('backDisabled', true);
  this.set('forwardDisabled', true);
  this.addMapListeners(map);
};
historyControl.prototype.goBack = function() {
  console.log('You want me to go back?');
};
historyControl.prototype.goForward = function() {
  console.log('You want me to go forward?');
};
historyControl.prototype.clearHistory = function() {
  this.set('history', []);
};
