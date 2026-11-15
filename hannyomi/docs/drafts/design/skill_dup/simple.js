G.__simple = 1; G.FX.beam = () => {}; const _fl = G.FX.flash; G.FX.flash = function (x, y, r, c, a) { if (y < 300) return; return _fl.apply(this, arguments); };
window.__noElite = 1;
