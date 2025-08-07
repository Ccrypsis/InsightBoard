const achievements = JSON.parse(
  document.getElementById('achievements-data').textContent
);
const unlocked    = new Set(
  JSON.parse(document.getElementById('unlocked-ids-data').textContent)
);

document.addEventListener('DOMContentLoaded', () => {
  let participationPoints = parseInt(document.getElementById('point-balance').textContent, 10);
  const achievements = window.__ACHIEVEMENTS__, unlocked = new Set(window.__UNLOCKED__);
  const pointEl = document.getElementById('point-balance'),
        badgeCtn = document.getElementById('badges-container'),
        toastCtn = document.getElementById('toast-container');

  function renderBadges() {
    badgeCtn.innerHTML = '';
    achievements.forEach(ach => {
      const s = document.createElement('span');
      s.className = `badge${unlocked.has(ach.id)?' unlocked':''}`;
      s.textContent = ach.name;
      badgeCtn.appendChild(s);
    });
  }

  function showToast(msg) {
    const t = document.createElement('div'); t.className='toast'; t.textContent=msg;
    toastCtn.appendChild(t);
    setTimeout(()=>t.remove(),3000);
  }

  function applyVote(postId, type, delta) {
    participationPoints += delta;
    pointEl.textContent = participationPoints;
    achievements.forEach(ach => {
      if (participationPoints >= ach.threshold && !unlocked.has(ach.id)) {
        unlocked.add(ach.id); renderBadges();
        showToast(`🏆 Achievement Unlocked: ${ach.name}!`);
      }
    });
    fetch('/vote', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({post_id:postId,type})
    });
  }

  renderBadges();

  document.querySelectorAll('.post').forEach(card => {
    const postId = card.id.split('-')[1];
    let up = +card.dataset.initialUpvotes || 0,
        dn = +card.dataset.initialDownvotes||0,
        state=0;  

    const [upBtn,dnBtn] = [card.querySelector('.upvote'), card.querySelector('.downvote')],
          [upCnt,dnCnt] = [card.querySelector('.up-count'), card.querySelector('.down-count')];

    function renderCounts() {
      upCnt.textContent = up; dnCnt.textContent = dn;
      upBtn.classList.toggle('voted-up',state===1);
      dnBtn.classList.toggle('voted-down',state===-1);
    }
    renderCounts();

    upBtn.addEventListener('click', () => {
      let delta=0;
      if (state===1)      { up--; state=0; delta=-1; }
      else if (state===-1){ dn--; up++; state=1; delta=0; }
      else                { up++; state=1; delta=+1; }
      renderCounts(); applyVote(postId,'up',delta);
    });
    dnBtn.addEventListener('click', () => {
      let delta=0;
      if (state===-1)      { dn--; state=0; delta=-1; }
      else if (state===1)  { up--; dn++; state=-1; delta=0; }
      else                { dn++; state=-1; delta=+1; }
      renderCounts(); applyVote(postId,'down',delta);
    });
  });
});
