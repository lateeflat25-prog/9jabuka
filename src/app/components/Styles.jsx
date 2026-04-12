const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --cream: #FDF8F2;
    --warm-white: #FEFCF9;
    --ink: #1A1208;
    --ink-soft: #3D2E1A;
    --ember: #C8440A;
    --ember-light: #E8541A;
    --gold: #D4A017;
    --gold-light: #F0C040;
    --sage: #4A6741;
    --sage-light: #6B9A60;
    --border: rgba(26,18,8,0.1);
    --shadow-warm: 0 4px 32px rgba(200,68,10,0.1);
    --shadow-deep: 0 16px 64px rgba(26,18,8,0.2);
    --radius: 20px;
    --radius-sm: 12px;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--ink); overflow-x: hidden; }
  .fos-root { min-height: 100vh; background: var(--cream); }

  /* ── Header ── */
  .fos-header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(253,248,242,0.85);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow .3s;
  }
  .fos-header.scrolled { box-shadow: 0 2px 40px rgba(26,18,8,0.12); }
  .fos-header-inner {
    max-width: 1280px; margin: 0 auto; padding: 0 2rem;
    height: 72px; display: flex; align-items: center;
    justify-content: space-between; gap: 1.5rem;
  }
  .fos-logo { height: 36px; width: auto; }
  .fos-nav { display: flex; align-items: center; gap: 2rem; }
  @media(max-width:900px){ .fos-nav { display: none; } }
  .fos-nav a {
    font-family: var(--font-body); font-size: 0.875rem; font-weight: 500;
    color: var(--ink-soft); text-decoration: none; letter-spacing: 0.02em;
    transition: color .2s; position: relative;
  }
  .fos-nav a::after {
    content: ''; position: absolute; bottom: -3px; left: 0; right: 0;
    height: 1.5px; background: var(--ember);
    transform: scaleX(0); transform-origin: left; transition: transform .25s;
  }
  .fos-nav a:hover { color: var(--ember); }
  .fos-nav a:hover::after { transform: scaleX(1); }
  .fos-search-wrap { flex: 1; max-width: 320px; position: relative; }
  @media(max-width:900px){ .fos-search-wrap { display: none; } }
  .fos-search-wrap svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9E876A; width: 16px; height: 16px; }
  .fos-search-input {
    width: 100%; padding: 10px 16px 10px 40px;
    border: 1.5px solid var(--border); border-radius: 50px;
    background: var(--warm-white); font-family: var(--font-body);
    font-size: 0.875rem; color: var(--ink); outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .fos-search-input:focus { border-color: var(--ember); box-shadow: 0 0 0 3px rgba(200,68,10,0.08); }
  .fos-search-input::placeholder { color: #BEA98A; }
  .fos-cart-btn {
    display: flex; align-items: center; gap: 10px;
    background: var(--ink); color: var(--cream); border: none;
    border-radius: 50px; padding: 10px 20px; cursor: pointer;
    font-family: var(--font-body); font-weight: 600; font-size: 0.875rem;
    transition: background .2s, transform .15s; position: relative; white-space: nowrap;
  }
  .fos-cart-btn:hover { background: var(--ink-soft); transform: translateY(-1px); }
  .fos-cart-badge {
    position: absolute; top: -6px; right: -6px;
    background: var(--ember); color: #fff; border-radius: 50%;
    width: 20px; height: 20px; font-size: 0.7rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--cream); animation: pop .2s ease;
  }
  @keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
  .fos-menu-btn {
    display: none; background: none; border: 1.5px solid var(--border);
    border-radius: 10px; padding: 8px; cursor: pointer; color: var(--ink); transition: background .2s;
  }
  @media(max-width:900px){ .fos-menu-btn { display: flex; align-items: center; } }
  .fos-menu-btn:hover { background: rgba(26,18,8,0.06); }
  .fos-mobile-menu {
    background: var(--warm-white); border-bottom: 1px solid var(--border);
    padding: 1rem 2rem 1.5rem; display: flex; flex-direction: column; gap: 1rem;
  }
  .fos-mobile-menu a { font-size: 0.9rem; font-weight: 500; color: var(--ink-soft); text-decoration: none; }

  /* ── Hero ── */
  .fos-hero {
    padding-top: 72px; position: relative; overflow: hidden;
    background: var(--ink); min-height: 420px; display: flex; align-items: flex-end;
  }
  .fos-hero-bg { position: absolute; inset: 0; background: url('/bg.jpg') center/cover no-repeat; opacity: 0.35; }
  .fos-hero-gradient { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(26,18,8,0.3) 0%, rgba(26,18,8,0.7) 60%, rgba(26,18,8,0.95) 100%); }
  .fos-hero-content {
    position: relative; z-index: 2; max-width: 1280px; margin: 0 auto;
    width: 100%; padding: 3rem 2rem 3.5rem; display: flex; flex-direction: column; gap: 1rem;
  }
  .fos-hero-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(212,160,23,0.18); border: 1px solid rgba(212,160,23,0.35);
    color: var(--gold-light); border-radius: 50px; padding: 5px 14px;
    font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; width: fit-content;
  }
  .fos-hero-title { font-family: var(--font-display); font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 900; color: #fff; line-height: 1.1; letter-spacing: -0.02em; }
  .fos-hero-title em { font-style: italic; color: var(--gold-light); }
  .fos-hero-sub { font-size: 1rem; color: rgba(255,255,255,0.65); max-width: 480px; line-height: 1.6; font-weight: 300; }
  .fos-hero-stats { display: flex; gap: 2rem; margin-top: 0.5rem; }
  .fos-hero-stat { display: flex; flex-direction: column; gap: 2px; }
  .fos-hero-stat-val { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--gold-light); }
  .fos-hero-stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.5); letter-spacing: 0.04em; font-weight: 500; }

  /* ── Layout ── */
  .fos-layout {
    max-width: 1280px; margin: 0 auto; padding: 2.5rem 2rem 4rem;
    display: grid; grid-template-columns: 240px 1fr; gap: 2.5rem; align-items: start;
  }
  @media(max-width:1024px){ .fos-layout { grid-template-columns: 1fr; } .fos-sidebar { display: none; } }

  /* ── Sidebar ── */
  .fos-sidebar {
    position: sticky; top: 92px; background: var(--warm-white);
    border: 1px solid var(--border); border-radius: var(--radius);
    padding: 1.5rem 1rem; box-shadow: var(--shadow-warm);
  }
  .fos-sidebar-title { font-family: var(--font-display); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #BEA98A; padding: 0 0.75rem 1rem; }
  .fos-cat-btn {
    width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border: none; border-radius: var(--radius-sm);
    cursor: pointer; font-family: var(--font-body); font-size: 0.875rem;
    font-weight: 500; color: var(--ink-soft); background: transparent;
    transition: all .18s; text-align: left;
  }
  .fos-cat-btn:hover { background: rgba(200,68,10,0.06); color: var(--ember); }
  .fos-cat-btn.active { background: var(--ember); color: #fff; }
  .fos-cat-btn.active .fos-cat-count { background: rgba(255,255,255,0.2); color: #fff; }
  .fos-cat-emoji { font-size: 1rem; width: 22px; text-align: center; }
  .fos-cat-name { flex: 1; }
  .fos-cat-count { font-size: 0.7rem; font-weight: 600; background: rgba(26,18,8,0.06); color: var(--ink-soft); border-radius: 50px; padding: 2px 8px; transition: all .18s; }

  /* ── Mobile categories ── */
  .fos-mobile-cats { display: none; gap: 0.5rem; flex-wrap: nowrap; overflow-x: auto; padding: 1.5rem 2rem 0; scrollbar-width: none; }
  .fos-mobile-cats::-webkit-scrollbar { display: none; }
  @media(max-width:1024px){ .fos-mobile-cats { display: flex; } }
  .fos-mobile-cat-pill {
    flex-shrink: 0; display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border: 1.5px solid var(--border); border-radius: 50px;
    cursor: pointer; font-family: var(--font-body); font-size: 0.8rem;
    font-weight: 500; color: var(--ink-soft); background: var(--warm-white);
    transition: all .18s; white-space: nowrap;
  }
  .fos-mobile-cat-pill:hover { border-color: var(--ember); color: var(--ember); }
  .fos-mobile-cat-pill.active { background: var(--ember); border-color: var(--ember); color: #fff; }

  /* ── Grid ── */
  .fos-grid-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
  .fos-grid-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--ink); }
  .fos-grid-count { font-size: 0.8rem; color: #9E876A; font-weight: 500; }
  .fos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 1.5rem; }

  /* ── Food Card ── */
  .fos-card {
    background: var(--warm-white); border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden;
    transition: transform .25s, box-shadow .25s; cursor: pointer; position: relative;
  }
  .fos-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-deep); }
  .fos-card.sold-out { opacity: 0.72; cursor: default; }
  .fos-card.sold-out:hover { transform: none; box-shadow: none; }
  .fos-card-img-wrap { position: relative; height: 200px; overflow: hidden; }
  .fos-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
  .fos-card:not(.sold-out):hover .fos-card-img { transform: scale(1.07); }
  .fos-card-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,18,8,0.5) 0%, transparent 50%); }
  .fos-card-badge { position: absolute; top: 12px; right: 12px; background: rgba(253,248,242,0.92); backdrop-filter: blur(8px); border-radius: 50px; padding: 4px 10px; font-size: 0.7rem; font-weight: 600; color: var(--ink-soft); letter-spacing: 0.04em; }
  .fos-card-sold-badge { position: absolute; top: 12px; left: 12px; background: rgba(200,68,10,0.92); backdrop-filter: blur(8px); border-radius: 50px; padding: 5px 12px; font-size: 0.7rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 4px; letter-spacing: 0.04em; text-transform: uppercase; }
  .fos-card-time { position: absolute; bottom: 12px; left: 12px; display: flex; align-items: center; gap: 5px; background: rgba(26,18,8,0.65); backdrop-filter: blur(6px); border-radius: 50px; padding: 4px 10px; font-size: 0.72rem; font-weight: 500; color: rgba(255,255,255,0.9); }
  .fos-card-body { padding: 1.1rem 1.2rem 1.2rem; }
  .fos-card-name { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--ink); margin-bottom: 0.35rem; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fos-card-desc { font-size: 0.8rem; color: #9E876A; line-height: 1.55; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .fos-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
  .fos-card-price-wrap { display: flex; flex-direction: column; }
  .fos-card-price { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--ember); line-height: 1; }
  .fos-card-price-from { font-size: 0.68rem; color: #BEA98A; font-weight: 500; margin-top: 2px; }
  .fos-add-btn { display: flex; align-items: center; gap: 6px; background: var(--ink); color: var(--cream); border: none; border-radius: 50px; padding: 9px 16px; font-family: var(--font-body); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background .18s, transform .15s; white-space: nowrap; }
  .fos-add-btn:hover:not(:disabled) { background: var(--ember); transform: scale(1.04); }
  .fos-add-btn:disabled { background: #D4CAC0; color: #9E8E80; cursor: not-allowed; }
  .fos-card-star { display: flex; align-items: center; gap: 3px; position: absolute; bottom: 12px; right: 12px; background: rgba(253,248,242,0.88); border-radius: 50px; padding: 3px 8px; font-size: 0.72rem; font-weight: 600; color: var(--ink-soft); backdrop-filter: blur(6px); }

  /* ── Modal ── */
  .fos-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(26,18,8,0.55); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadein .2s ease; }
  @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
  .fos-modal { background: var(--warm-white); border-radius: var(--radius); max-width: 460px; width: 100%; overflow: hidden; box-shadow: var(--shadow-deep); animation: slideup .25s ease; }
  @keyframes slideup { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .fos-modal-img { width: 100%; height: 200px; object-fit: cover; }
  .fos-modal-body { padding: 1.5rem; }
  .fos-modal-title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; color: var(--ink); margin-bottom: 1.25rem; }
  .fos-modal-close { position: absolute; top: 12px; right: 12px; background: rgba(253,248,242,0.9); border: none; border-radius: 50%; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s; color: var(--ink); }
  .fos-modal-close:hover { background: #fff; }
  .fos-field-label { display: block; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #9E876A; margin-bottom: 0.5rem; }
  .fos-select, .fos-textarea, .fos-input { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); background: var(--cream); font-family: var(--font-body); font-size: 0.875rem; color: var(--ink); outline: none; transition: border-color .2s, box-shadow .2s; }
  .fos-select:focus, .fos-textarea:focus, .fos-input:focus { border-color: var(--ember); box-shadow: 0 0 0 3px rgba(200,68,10,0.08); }
  .fos-textarea { resize: none; }
  .fos-qty-row { display: flex; align-items: center; gap: 1rem; }
  .fos-qty-btn { width: 36px; height: 36px; border: 1.5px solid var(--border); border-radius: 50%; background: var(--cream); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .18s; color: var(--ink); }
  .fos-qty-btn:hover { border-color: var(--ember); color: var(--ember); }
  .fos-qty-val { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; color: var(--ink); min-width: 32px; text-align: center; }
  .fos-field-group { margin-bottom: 1.25rem; }
  .fos-modal-footer { padding: 0 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .fos-modal-total { display: flex; justify-content: space-between; align-items: center; }
  .fos-modal-total-label { font-size: 0.85rem; color: #9E876A; font-weight: 500; }
  .fos-modal-total-price { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; color: var(--ember); }
  .fos-primary-btn { width: 100%; padding: 14px; background: var(--ember); color: #fff; border: none; border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: background .2s, transform .15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .fos-primary-btn:hover { background: var(--ember-light); transform: translateY(-1px); }
  .fos-primary-btn:active { transform: translateY(0); }

  /* ── Cart Sidebar ── */
  .fos-cart-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(26,18,8,0.5); animation: fadein .2s; }
  .fos-cart-panel { position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 420px; background: var(--warm-white); z-index: 201; display: flex; flex-direction: column; box-shadow: -8px 0 60px rgba(26,18,8,0.2); animation: slidein .25s ease; }
  @keyframes slidein { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .fos-cart-header { padding: 1.5rem 1.5rem 1.25rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
  .fos-cart-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 10px; }
  .fos-cart-title-count { background: var(--ember); color: #fff; border-radius: 50px; padding: 1px 10px; font-family: var(--font-body); font-size: 0.8rem; font-weight: 700; }
  .fos-close-btn { width: 36px; height: 36px; border: 1.5px solid var(--border); border-radius: 50%; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .18s; color: var(--ink); }
  .fos-close-btn:hover { background: var(--cream); border-color: var(--ink); }
  .fos-cart-items { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  .fos-cart-item { display: flex; align-items: center; gap: 0.875rem; padding: 0.875rem; background: var(--cream); border-radius: var(--radius-sm); border: 1px solid var(--border); }
  .fos-cart-item-img { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
  .fos-cart-item-info { flex: 1; min-width: 0; }
  .fos-cart-item-name { font-weight: 600; font-size: 0.875rem; color: var(--ink); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fos-cart-item-meta { font-size: 0.75rem; color: #9E876A; }
  .fos-cart-item-price { font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; color: var(--ember); }
  .fos-cart-qty { display: flex; align-items: center; gap: 6px; }
  .fos-cart-qty-btn { width: 26px; height: 26px; border: 1.5px solid var(--border); border-radius: 50%; background: var(--warm-white); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; color: var(--ink-soft); flex-shrink: 0; }
  .fos-cart-qty-btn:hover { border-color: var(--ember); color: var(--ember); }
  .fos-cart-qty-val { font-weight: 700; font-size: 0.875rem; min-width: 18px; text-align: center; color: var(--ink); }
  .fos-cart-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; gap: 0.75rem; }
  .fos-cart-empty-icon { width: 72px; height: 72px; background: var(--cream); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; border: 2px dashed var(--border); }
  .fos-cart-empty-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--ink); }
  .fos-cart-empty-sub { font-size: 0.85rem; color: #9E876A; }
  .fos-cart-footer { padding: 1.25rem 1.5rem 1.5rem; border-top: 1px solid var(--border); }
  .fos-cart-line { display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.5rem; color: #9E876A; }
  .fos-cart-line span:last-child { color: var(--ink); font-weight: 500; }
  .fos-cart-total { display: flex; justify-content: space-between; align-items: center; margin: 0.75rem 0 1.25rem; padding-top: 0.75rem; border-top: 1px solid var(--border); }
  .fos-cart-total-label { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--ink); }
  .fos-cart-total-price { font-family: var(--font-display); font-size: 1.4rem; font-weight: 900; color: var(--ember); }

  /* ── Delivery fee box ── */
  .fos-delivery-info {
    background: rgba(200,68,10,0.06); border: 1px solid rgba(200,68,10,0.15);
    border-radius: var(--radius-sm); padding: 0.75rem 1rem;
    font-size: 0.8rem; color: var(--ink-soft); margin-bottom: 0.75rem;
    display: flex; align-items: center; gap: 8px;
  }
  .fos-delivery-info.success { background: rgba(74,103,65,0.06); border-color: rgba(74,103,65,0.2); }
  .fos-delivery-info.error { background: rgba(200,68,10,0.08); border-color: rgba(200,68,10,0.25); color: var(--ember); }

  /* ── Checkout ── */
  .fos-checkout-modal { background: var(--warm-white); border-radius: var(--radius); max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-deep); animation: slideup .25s ease; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  .fos-checkout-header { padding: 1.75rem 1.75rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; position: sticky; top: 0; background: var(--warm-white); z-index: 1; border-radius: var(--radius) var(--radius) 0 0; }
  .fos-checkout-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--ink); }
  .fos-checkout-sub { font-size: 0.82rem; color: #9E876A; margin-top: 3px; }
  .fos-checkout-body { padding: 1.75rem; display: flex; flex-direction: column; gap: 1.5rem; }
  .fos-section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 1rem; }
  .fos-section-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--ink); }
  .fos-section-icon { color: var(--ember); }
  .fos-input-group { display: flex; flex-direction: column; gap: 0.75rem; }
  .fos-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .fos-input-icon-wrap { position: relative; }
  .fos-input-icon-wrap svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #BEA98A; width: 16px; height: 16px; pointer-events: none; }
  .fos-input-icon-wrap .fos-input { padding-left: 38px; }
  .fos-error-text { font-size: 0.75rem; color: var(--ember); margin-top: 3px; }
  .fos-order-summary { background: var(--cream); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem; }
  .fos-summary-item { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--ink-soft); margin-bottom: 0.4rem; }
  .fos-summary-divider { border: none; border-top: 1px solid var(--border); margin: 0.75rem 0; }
  .fos-summary-total { display: flex; justify-content: space-between; align-items: baseline; }
  .fos-summary-total-label { font-family: var(--font-display); font-weight: 700; font-size: 1rem; color: var(--ink); }
  .fos-summary-total-price { font-family: var(--font-display); font-weight: 900; font-size: 1.5rem; color: var(--ember); }
  .fos-pay-btn { width: 100%; padding: 16px; background: var(--ember); color: #fff; border: none; border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background .2s, transform .15s; letter-spacing: 0.01em; }
  .fos-pay-btn:hover:not(:disabled) { background: var(--ember-light); transform: translateY(-1px); }
  .fos-pay-btn:disabled { background: #D4CAC0; cursor: not-allowed; transform: none; }

  /* ── Locate me button ── */
  .fos-locate-btn {
    display: flex; align-items: center; gap: 6px;
    background: var(--ink); color: var(--cream); border: none;
    border-radius: var(--radius-sm); padding: 10px 14px;
    font-family: var(--font-body); font-size: 0.8rem; font-weight: 600;
    cursor: pointer; transition: background .18s; white-space: nowrap;
    flex-shrink: 0;
  }
  .fos-locate-btn:hover:not(:disabled) { background: var(--ember); }
  .fos-locate-btn:disabled { background: #D4CAC0; cursor: not-allowed; }
  .fos-address-row { display: flex; gap: 0.5rem; align-items: flex-start; }
  .fos-address-row .fos-input { flex: 1; }

  /* ── Delivery distance badge ── */
  .fos-dist-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 50px;
    font-size: 0.75rem; font-weight: 600;
  }
  .fos-dist-badge.ok { background: rgba(74,103,65,0.1); color: var(--sage); border: 1px solid rgba(74,103,65,0.2); }
  .fos-dist-badge.warn { background: rgba(200,68,10,0.08); color: var(--ember); border: 1px solid rgba(200,68,10,0.2); }

  /* ── Toast ── */
  .fos-toast { position: fixed; top: 88px; left: 50%; transform: translateX(-50%); z-index: 300; min-width: 280px; max-width: 420px; border-radius: var(--radius-sm); padding: 1rem 1.25rem; box-shadow: var(--shadow-deep); display: flex; align-items: flex-start; gap: 0.75rem; animation: slidedown .25s ease; }
  @keyframes slidedown { from { transform: translateX(-50%) translateY(-20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
  .fos-toast.success { background: #F0FAF0; border: 1px solid #B7DEB7; }
  .fos-toast.error { background: #FEF1EE; border: 1px solid #F5C0B0; }
  .fos-toast-icon { flex-shrink: 0; margin-top: 1px; }
  .fos-toast-title { font-weight: 600; font-size: 0.9rem; color: var(--ink); }
  .fos-toast-sub { font-size: 0.8rem; margin-top: 2px; color: var(--ink-soft); opacity: 0.75; }
  .fos-toast-close { margin-left: auto; background: none; border: none; cursor: pointer; color: #9E876A; padding: 2px; border-radius: 4px; transition: color .15s; flex-shrink: 0; }
  .fos-toast-close:hover { color: var(--ink); }

  /* ── Loader ── */
  .fos-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 2rem; gap: 1rem; }
  .fos-spinner { width: 44px; height: 44px; border: 3px solid var(--border); border-top-color: var(--ember); border-radius: 50%; animation: spin .8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fos-loader-text { font-family: var(--font-display); font-size: 1rem; color: #9E876A; font-style: italic; }

  /* ── Empty state ── */
  .fos-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 2rem; text-align: center; gap: 0.75rem; }
  .fos-empty-emoji { font-size: 4rem; margin-bottom: 0.5rem; }
  .fos-empty-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--ink); }
  .fos-empty-sub { font-size: 0.9rem; color: #9E876A; }
  .fos-empty-btn { margin-top: 0.75rem; padding: 10px 24px; background: var(--ember); color: #fff; border: none; border-radius: 50px; cursor: pointer; font-family: var(--font-body); font-weight: 600; font-size: 0.875rem; transition: background .2s; }
  .fos-empty-btn:hover { background: var(--ember-light); }

  /* ── Footer ── */
  .fos-footer { background: var(--ink); color: rgba(255,255,255,0.6); padding: 4rem 2rem 2rem; margin-top: 5rem; }
  .fos-footer-inner { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; }
  @media(max-width:768px){ .fos-footer-inner { grid-template-columns: 1fr; gap: 2rem; } }
  .fos-footer-logo { height: 36px; width: auto; filter: brightness(0) invert(1); opacity: 0.8; margin-bottom: 1rem; }
  .fos-footer-desc { font-size: 0.85rem; line-height: 1.7; max-width: 340px; margin-bottom: 1.25rem; }
  .fos-footer-info { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.82rem; }
  .fos-footer-info-row { display: flex; align-items: center; gap: 8px; }
  .fos-footer-heading { font-family: var(--font-display); font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem; letter-spacing: 0.01em; }
  .fos-footer-links { display: flex; flex-direction: column; gap: 0.6rem; }
  .fos-footer-links a { font-size: 0.85rem; color: rgba(255,255,255,0.5); text-decoration: none; transition: color .2s; }
  .fos-footer-links a:hover { color: var(--gold-light); }
  .fos-footer-bottom { max-width: 1280px; margin: 3rem auto 0; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 0.78rem; color: rgba(255,255,255,0.3); }
  .fos-stripe { height: 3px; background: linear-gradient(90deg, var(--ember), var(--gold), var(--sage), var(--ember)); background-size: 200% 100%; animation: movestripe 4s linear infinite; }
  @keyframes movestripe { to { background-position: 200% 0; } }
  .fos-food-scroll { overflow-y: auto; max-height: calc(100vh - 10rem); scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  @media(max-width:1024px){ .fos-food-scroll { max-height: unset; overflow-y: unset; } }

  /* ── Spinning inline icon ── */
  .fos-spin { animation: spin .7s linear infinite; }
`;

export default GLOBAL_STYLES;