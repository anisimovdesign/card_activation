/**
 * ActivationScreen — phone shell with envelope tear + keyboard reveal.
 */
(function (global) {
  'use strict';

  var KEY_ROWS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
  ];

  var ENVELOPE_DESIGN = { width: 343, height: 221 };

  function resolveEnvelopeScale() {
    var designWidth = ENVELOPE_DESIGN.width;
    var viewportWidth =
      (window.visualViewport && window.visualViewport.width) || window.innerWidth || designWidth;
    var horizontalInset = 32;
    var available = viewportWidth - horizontalInset;

    return Math.min(1, available / designWidth);
  }

  function ActivationScreen(root, options) {
    this.root = root;
    this.options = options || {};
    this.envelope = null;
    this._build();
  }

  ActivationScreen.create = function (container, options) {
    var el = document.createElement('div');
    el.className = 'activation';
    container.appendChild(el);
    return new ActivationScreen(el, options);
  };

  ActivationScreen.prototype._buildKeyboard = function () {
    var html = '<div class="activation__keys">';

    for (var r = 0; r < KEY_ROWS.length; r++) {
      html += '<div class="activation__key-row">';
      var row = KEY_ROWS[r];
      for (var c = 0; c < row.length; c++) {
        var key = row[c];
        if (key === '') {
          html += '<button type="button" class="activation__key activation__key--ghost" tabindex="-1"></button>';
        } else if (key === 'delete') {
          html +=
            '<button type="button" class="activation__key activation__key--delete" tabindex="-1" aria-label="Удалить">⌫</button>';
        } else {
          html +=
            '<button type="button" class="activation__key" tabindex="-1">' + key + '</button>';
        }
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  };

  ActivationScreen.prototype._build = function () {
    var opts = this.options;

    this.root.innerHTML =
      '<header class="activation__nav">' +
      '<button type="button" class="activation__back" aria-label="Назад" tabindex="-1">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M14.5 6L9 11.5L14.5 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg></button>' +
      '<h1 class="activation__title">Активация</h1>' +
      '</header>' +
      '<div class="activation__body">' +
      '<div class="activation__center">' +
      '<div class="activation__envelope-host"></div>' +
      '</div>' +
      '<p class="activation__hint" hidden>Впишите номер пластиковой карты</p>' +
      '</div>' +
      '<footer class="activation__footer">' +
      '<div class="activation__keyboard" hidden>' +
      this._buildKeyboard() +
      '</div>' +
      '<div class="activation__intro">' +
      '<h2 class="activation__intro-title">Карта уже у вас, осталось активировать</h2>' +
      '<p class="activation__intro-text">Рвём конверт, прям как подарочную упаковку</p>' +
      '</div>' +
      '<button type="button" class="activation__btn" tabindex="-1">' +
      '<span class="activation__btn-label" data-state="start">Начать активацию</span>' +
      '<span class="activation__btn-label" data-state="next" hidden>Далее</span>' +
      '</button>' +
      '<div class="activation__home-bar" aria-hidden="true"></div>' +
      '</footer>';

    this.btnLabels = {
      start: this.root.querySelector('[data-state="start"]'),
      next: this.root.querySelector('[data-state="next"]'),
    };

    var envelopeHost = this.root.querySelector('.activation__envelope-host');
    var self = this;
    var envelopeOpts = Object.assign({}, opts.envelope || {});
    var userRevealComplete = envelopeOpts.onRevealComplete;

    envelopeOpts.onRevealComplete = function () {
      window.setTimeout(function () {
        self._showKeyboard();
      }, 280);
      if (typeof userRevealComplete === 'function') userRevealComplete();
    };

    var envelopeScale = resolveEnvelopeScale();
    envelopeOpts.scale = envelopeScale;
    envelopeHost.style.setProperty('--env-scale', envelopeScale);
    envelopeHost.style.setProperty(
      '--env-layout-h',
      Math.ceil(ENVELOPE_DESIGN.height * envelopeScale) + 'px'
    );

    this.envelope = global.SplitEnvelope.create(envelopeHost, envelopeOpts);
  };

  ActivationScreen.prototype._showKeyboard = function () {
    if (this.root.classList.contains('is-keyboard')) return;

    var hint = this.root.querySelector('.activation__hint');
    var keyboard = this.root.querySelector('.activation__keyboard');

    hint.hidden = false;
    keyboard.hidden = false;

    this.root.classList.add('is-keyboard');
    this.envelope.showKeyboard();

    this.btnLabels.start.hidden = true;
    this.btnLabels.next.hidden = false;
  };

  ActivationScreen.prototype.destroy = function () {
    if (this.envelope) this.envelope.destroy();
    this.root.innerHTML = '';
    this.root.className = '';
  };

  global.ActivationScreen = ActivationScreen;
})(typeof window !== 'undefined' ? window : globalThis);
