(function(){
  const el = id => document.getElementById(id);
  const len = el('len');
  const lenVal = el('lenVal');
  const lower = el('lower');
  const upper = el('upper');
  const digits = el('digits');
  const symbols = el('symbols');
  const noSimilar = el('noSimilar');
  const noAmbiguous = el('noAmbiguous');
  const out = el('password');
  const copyBtns = [el('copyBtn'), el('copyBtn2')];
  const genBtns = [el('genBtn'), el('genBtn2')];
  const strength = el('strength');
  const entropyLabel = el('entropy');
  const strengthLabel = el('strengthLabel');
  const toast = el('toast');

  len.addEventListener('input',()=> lenVal.textContent = len.value);
  genBtns.forEach(btn => btn.addEventListener('click', generate));
  copyBtns.forEach(btn => btn.addEventListener('click', copy));

  function charset(){
    let L = 'abcdefghijklmnopqrstuvwxyz';
    let U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let D = '0123456789';
    let S = "!@#$%^&*()-_=+?";
    const similar = /[O0oIl1]/g;
    const ambiguous = /[{}\[\]\/\\'"`~,;:.<>]/g;


    if(noSimilar.checked){ L=L.replace(similar,''); U=U.replace(similar,''); D=D.replace(similar,''); }
    if(noAmbiguous.checked){ S=S.replace(ambiguous,''); }

    const sets = [];
    if(lower.checked) sets.push(L);
    if(upper.checked) sets.push(U);
    if(digits.checked) sets.push(D);
    if(symbols.checked) sets.push(S);
    return sets;
  }

  function crand(max){
    const buf = new Uint32Array(1);
    let x;
    do { crypto.getRandomValues(buf); x = buf[0]; }
    while (x >= Math.floor(0xFFFFFFFF / max) * max);
    return x % max;
  }

  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = crand(i+1); [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  function estimateEntropy(pool, length){
    if(pool <= 1 || length <= 0) return 0;
    return Math.round(length * Math.log2(pool));
  }

  function updateStrength(bits){
    strength.value = Math.min(bits, 100);
    entropyLabel.textContent = bits + ' bita';
    let label = 'Slabo';
    if(bits >= 80) label = 'Odlično';
    else if(bits >= 60) label = 'Jako';
    else if(bits >= 40) label = 'Srednje';
    strengthLabel.textContent = 'Jačina: ' + label;
  }

  function generate(){
    const sets = charset();
    const L = parseInt(len.value,10);
    if(sets.length === 0){
      out.value = '';
      copyBtns.forEach(b=>b.disabled=true);
      updateStrength(0);
      alert('Odaberi barem jednu grupu znakova.');
      return;
    }

    const required = sets.map(set => set[crand(set.length)]);
    const pool = sets.join('');
    const remaining = L - required.length;
    const rest = [];
    for(let i=0;i<remaining;i++) rest.push(pool[crand(pool.length)]);

    const pwd = shuffle(required.concat(rest)).join('');
    out.value = pwd;
    copyBtns.forEach(b=>b.disabled=false);

    const bits = estimateEntropy(pool.length, L);
    updateStrength(bits);
  }

  async function copy(){
    if(!out.value) return;
    try{
      await navigator.clipboard.writeText(out.value);
      toast.style.display='block';
      setTimeout(()=>toast.style.display='none', 1200);
    }catch(e){
      out.select(); document.execCommand('copy');
    }
  }

  generate();
})();
