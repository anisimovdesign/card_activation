/**
 * SplitEnvelope — layered card with tear-strip on top.
 *
 * Layers (bottom → top):
 *   inside (centered) → form (centered) → top + bottom (pinned) → tear animation
 */
(function (global) {
  'use strict';

  var DEFAULTS = {
    width: 343,
    height: 221,
    tearBottom: 38.8,
    insideSrc: 'Split_envelope_inside.png',
    formSrc: 'Form.png',
    topSrc: 'Split_envelope_top.png',
    bottomSrc: 'Split_envelope_bottom.png',
    stripOptions: {
      animationMode: 'scatter',
      color: '#19CA41',
      segmentWidth: 24.6,
      segmentHeight: 30,
    },
  };

  function SplitEnvelope(root, options) {
    this.root = root;
    this.options = Object.assign({}, DEFAULTS, options || {});
    this.strip = null;

    this._build();
  }

  SplitEnvelope.create = function (container, options) {
    var opts = Object.assign({}, options || {});
    var scale = typeof opts.scale === 'number' ? opts.scale : 1;
    var el = document.createElement('div');
    el.className = 'split-envelope';
    el.style.setProperty('--env-w', (opts.width || DEFAULTS.width) + 'px');
    el.style.setProperty('--env-h', (opts.height || DEFAULTS.height) + 'px');
    el.style.setProperty('--env-scale', String(scale));
    el.style.setProperty('--env-tear-bottom', (opts.tearBottom || DEFAULTS.tearBottom) + 'px');
    container.appendChild(el);
    return new SplitEnvelope(el, opts);
  };

  SplitEnvelope.prototype._build = function () {
    var opts = this.options;
    var stripOpts = Object.assign({}, opts.stripOptions || {});

    this.root.innerHTML =
      '<img class="split-envelope__inside" src="' +
      opts.insideSrc +
      '" alt="" draggable="false">' +
      '<img class="split-envelope__form" src="' +
      opts.formSrc +
      '" alt="" draggable="false">' +
      '<img class="split-envelope__top" src="' +
      opts.topSrc +
      '" alt="" draggable="false">' +
      '<img class="split-envelope__bottom" src="' +
      opts.bottomSrc +
      '" alt="" draggable="false">' +
      '<div class="split-envelope__tear"></div>';

    this.tearHost = this.root.querySelector('.split-envelope__tear');
    this.formEl = this.root.querySelector('.split-envelope__form');

    var width = opts.width || DEFAULTS.width;
    var segW = stripOpts.segmentWidth || 30;
    stripOpts.segmentCount = stripOpts.segmentCount || Math.ceil(width / segW);
    stripOpts.fillWidth = true;

    var self = this;
    var userOnComplete = stripOpts.onComplete;
    var userOnProgress = stripOpts.onProgress;

    stripOpts.onProgress = function (tearPx, tornCount, remaining) {
      self._updateFlapRotation(remaining);
      if (typeof userOnProgress === 'function') userOnProgress(tearPx, tornCount, remaining);
    };

    stripOpts.onComplete = function () {
      self._revealInside();
      if (typeof userOnComplete === 'function') userOnComplete();
      if (typeof opts.onComplete === 'function') opts.onComplete();
    };

    this.strip = global.TearStrip.create(this.tearHost, stripOpts);
    this._updateFlapRotation(this.strip.segmentCount);
  };

  SplitEnvelope.prototype._getFlapRotation = function (remaining) {
    if (remaining > 2) return 0;
    if (remaining === 2) return 2;
    if (remaining === 1) return 3;
    return 4;
  };

  SplitEnvelope.prototype._updateFlapRotation = function (remaining) {
    var deg = this._getFlapRotation(remaining);
    this.root.style.setProperty('--env-top-rotate', deg + 'deg');
    this.root.style.setProperty('--env-bottom-rotate', -deg + 'deg');
  };

  SplitEnvelope.prototype._revealInside = function () {
    var self = this;
    this.root.classList.add('is-revealed');

    var onFormEnd = function (e) {
      if (e.animationName !== 'env-form-open') return;
      self.formEl.removeEventListener('animationend', onFormEnd);
      if (typeof self.options.onRevealComplete === 'function') {
        self.options.onRevealComplete();
      }
    };

    this.formEl.addEventListener('animationend', onFormEnd);
  };

  SplitEnvelope.prototype.showKeyboard = function () {
    this.root.classList.add('is-keyboard');
  };

  SplitEnvelope.prototype.destroy = function () {
    if (this.strip) this.strip.destroy();
    this.root.innerHTML = '';
    this.root.className = '';
  };

  global.SplitEnvelope = SplitEnvelope;
})(typeof window !== 'undefined' ? window : globalThis);
