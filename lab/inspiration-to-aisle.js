/* inspiration-to-aisle.js -- the service map's two presses, and nothing
   else. One page loads it, lab/inspiration-to-aisle.html.

   THE VIEW. The map has a Today lane and a Connected lane. Without this
   script both show and the switch stays hidden; with it the switch
   appears, the figure carries .is-today or .is-connected, and the CSS
   shows one lane. Today is where it starts, because the seam is the
   page's argument.

   FOLLOWING A MOMENT. Each moment's name becomes a button; pressed, its
   column takes the tea-light ground from the shopper to the systems, and
   pressing it again lets it go. One moment at a time. The words never
   change, only which lane shows and which column is lit, so the page
   reads the same to a screen reader with or without a press. */
(function () {
  var map = document.querySelector('.ia-map');
  if (!map) return;

  var view = map.querySelector('.ia-view');
  var buttons = view ? view.querySelectorAll('[data-view]') : [];
  function show(which) {
    map.classList.toggle('is-today', which === 'today');
    map.classList.toggle('is-connected', which === 'connected');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-view') === which));
    }
  }
  if (view) {
    view.hidden = false;
    for (var b = 0; b < buttons.length; b++) {
      buttons[b].addEventListener('click', function () { show(this.getAttribute('data-view')); });
    }
    show('today');
  }

  var moments = map.querySelectorAll('.ia-moment');
  var picks = [];
  for (var m = 0; m < moments.length; m++) {
    var name = moments[m].querySelector('.ia-moment-name');
    if (!name) continue;
    var pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'ia-moment-pick';
    pick.setAttribute('data-moment', String(m + 1));
    pick.setAttribute('aria-pressed', 'false');
    while (name.firstChild) pick.appendChild(name.firstChild);
    name.appendChild(pick);
    picks.push(pick);
  }
  picks.forEach(function (pick, i) {
    pick.addEventListener('click', function () {
      var on = pick.getAttribute('aria-pressed') !== 'true';
      picks.forEach(function (p, j) {
        var lit = on && j === i;
        p.setAttribute('aria-pressed', String(lit));
        moments[j].classList.toggle('is-followed', lit);
      });
    });
  });
})();
