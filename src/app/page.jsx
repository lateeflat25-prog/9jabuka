'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Plus, Minus, X, Clock, MapPin, Phone, Star,
  Search, CheckCircle, XCircle, Menu, ChevronRight, Flame,
  Sparkles, ArrowRight, Leaf
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getFoods } from '../../src/app/lib/api';
import Link from 'next/link';

// ─── Stripe ───────────────────────────────────────────────────────────────────
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const createCheckoutSession = async (orderData) => {
  const response = await fetch('https://9jabukabackend-inky.vercel.app/api/orders/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to create checkout session');
  return result;
};

// ─── Delivery ─────────────────────────────────────────────────────────────────
const VALID_ZIP_CODES = [
  '07102','07103','07104','07105','07106','07107','07108','07112','07114',
  '07111','07017','07018','07029'
];

const calculateDistance = async (userAddress) => {
  const zipToDistance = {
    '07103':0,'07111':2,'07102':1,'07104':2,'07105':3,'07106':2.5,
    '07107':2,'07108':1.5,'07112':2,'07114':3,'07017':3.5,'07018':3.5,'07029':4
  };
  const userZip = userAddress.match(/\b\d{5}\b/)?.[0];
  const distance = zipToDistance[userZip] ?? 5;
  let deliveryFee;
  if (distance === 1) deliveryFee = 8.00;
  else if (distance === 2) deliveryFee = 10.00;
  else deliveryFee = Number((2 + distance).toFixed(2));
  return { distance, deliveryFee };
};

// ─── Category emoji map ───────────────────────────────────────────────────────
const CAT_EMOJI = {
  all: '✦', rice: '🍚', soup: '🍲', swallow: '🫕', snacks: '🥘',
  drinks: '🥤', protein: '🍗', dessert: '🍮', sides: '🥗',
};

const formatCategoryName = (cat) =>
  cat === 'all' ? 'All Items' : cat.charAt(0).toUpperCase() + cat.slice(1);

// ─── Inline Styles (injected once) ────────────────────────────────────────────
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

  body {
    font-family: var(--font-body);
    background: var(--cream);
    color: var(--ink);
    overflow-x: hidden;
  }

  .fos-root {
    min-height: 100vh;
    background: var(--cream);
  }

  /* ── Header ── */
  .fos-header {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(253,248,242,0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow .3s;
  }
  .fos-header.scrolled { box-shadow: 0 2px 40px rgba(26,18,8,0.12); }

  .fos-header-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .fos-logo { height: 36px; width: auto; }

  .fos-nav { display: flex; align-items: center; gap: 2rem; }
  @media(max-width:900px){ .fos-nav { display: none; } }

  .fos-nav a {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ink-soft);
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: color .2s;
    position: relative;
  }
  .fos-nav a::after {
    content: '';
    position: absolute;
    bottom: -3px; left: 0; right: 0;
    height: 1.5px;
    background: var(--ember);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .25s;
  }
  .fos-nav a:hover { color: var(--ember); }
  .fos-nav a:hover::after { transform: scaleX(1); }

  .fos-search-wrap {
    flex: 1;
    max-width: 320px;
    position: relative;
  }
  @media(max-width:900px){ .fos-search-wrap { display: none; } }
  .fos-search-wrap svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #9E876A;
    width: 16px; height: 16px;
  }
  .fos-search-input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1.5px solid var(--border);
    border-radius: 50px;
    background: var(--warm-white);
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--ink);
    outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .fos-search-input:focus {
    border-color: var(--ember);
    box-shadow: 0 0 0 3px rgba(200,68,10,0.08);
  }
  .fos-search-input::placeholder { color: #BEA98A; }

  .fos-cart-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--ink);
    color: var(--cream);
    border: none;
    border-radius: 50px;
    padding: 10px 20px;
    cursor: pointer;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.875rem;
    transition: background .2s, transform .15s;
    position: relative;
    white-space: nowrap;
  }
  .fos-cart-btn:hover { background: var(--ink-soft); transform: translateY(-1px); }
  .fos-cart-badge {
    position: absolute;
    top: -6px; right: -6px;
    background: var(--ember);
    color: #fff;
    border-radius: 50%;
    width: 20px; height: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--cream);
    animation: pop .2s ease;
  }
  @keyframes pop {
    0% { transform: scale(0); }
    70% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  .fos-menu-btn {
    display: none;
    background: none;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 8px;
    cursor: pointer;
    color: var(--ink);
    transition: background .2s;
  }
  @media(max-width:900px){ .fos-menu-btn { display: flex; align-items: center; } }
  .fos-menu-btn:hover { background: rgba(26,18,8,0.06); }

  /* ── Mobile menu ── */
  .fos-mobile-menu {
    background: var(--warm-white);
    border-bottom: 1px solid var(--border);
    padding: 1rem 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .fos-mobile-menu a {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--ink-soft);
    text-decoration: none;
  }

  /* ── Hero ── */
  .fos-hero {
    padding-top: 72px;
    position: relative;
    overflow: hidden;
    background: var(--ink);
    min-height: 420px;
    display: flex;
    align-items: flex-end;
  }
  .fos-hero-bg {
    position: absolute;
    inset: 0;
    background: url('/bg.jpg') center/cover no-repeat;
    opacity: 0.35;
  }
  .fos-hero-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(26,18,8,0.3) 0%,
      rgba(26,18,8,0.7) 60%,
      rgba(26,18,8,0.95) 100%
    );
  }
  .fos-hero-content {
    position: relative;
    z-index: 2;
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
    padding: 3rem 2rem 3.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .fos-hero-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(212,160,23,0.18);
    border: 1px solid rgba(212,160,23,0.35);
    color: var(--gold-light);
    border-radius: 50px;
    padding: 5px 14px;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    width: fit-content;
  }
  .fos-hero-title {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 5vw, 4rem);
    font-weight: 900;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }
  .fos-hero-title em {
    font-style: italic;
    color: var(--gold-light);
  }
  .fos-hero-sub {
    font-size: 1rem;
    color: rgba(255,255,255,0.65);
    max-width: 480px;
    line-height: 1.6;
    font-weight: 300;
  }
  .fos-hero-stats {
    display: flex;
    gap: 2rem;
    margin-top: 0.5rem;
  }
  .fos-hero-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .fos-hero-stat-val {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--gold-light);
  }
  .fos-hero-stat-label {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.04em;
    font-weight: 500;
  }
  .fos-hero-logo {
    height: 80px;
    width: auto;
    filter: brightness(0) invert(1);
    opacity: 0.9;
  }

  /* ── Layout ── */
  .fos-layout {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2.5rem 2rem 4rem;
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 2.5rem;
    align-items: start;
  }
  @media(max-width:1024px){
    .fos-layout { grid-template-columns: 1fr; }
    .fos-sidebar { display: none; }
  }

  /* ── Sidebar ── */
  .fos-sidebar {
    position: sticky;
    top: 92px;
    background: var(--warm-white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.5rem 1rem;
    box-shadow: var(--shadow-warm);
  }
  .fos-sidebar-title {
    font-family: var(--font-display);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #BEA98A;
    padding: 0 0.75rem 1rem;
  }
  .fos-cat-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ink-soft);
    background: transparent;
    transition: all .18s;
    text-align: left;
  }
  .fos-cat-btn:hover { background: rgba(200,68,10,0.06); color: var(--ember); }
  .fos-cat-btn.active { background: var(--ember); color: #fff; }
  .fos-cat-btn.active .fos-cat-count { background: rgba(255,255,255,0.2); color: #fff; }
  .fos-cat-emoji { font-size: 1rem; width: 22px; text-align: center; }
  .fos-cat-name { flex: 1; }
  .fos-cat-count {
    font-size: 0.7rem;
    font-weight: 600;
    background: rgba(26,18,8,0.06);
    color: var(--ink-soft);
    border-radius: 50px;
    padding: 2px 8px;
    transition: all .18s;
  }

  /* ── Mobile categories ── */
  .fos-mobile-cats {
    display: none;
    gap: 0.5rem;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 1.5rem 2rem 0;
    scrollbar-width: none;
  }
  .fos-mobile-cats::-webkit-scrollbar { display: none; }
  @media(max-width:1024px){ .fos-mobile-cats { display: flex; } }
  .fos-mobile-cat-pill {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1.5px solid var(--border);
    border-radius: 50px;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--ink-soft);
    background: var(--warm-white);
    transition: all .18s;
    white-space: nowrap;
  }
  .fos-mobile-cat-pill:hover { border-color: var(--ember); color: var(--ember); }
  .fos-mobile-cat-pill.active {
    background: var(--ember);
    border-color: var(--ember);
    color: #fff;
  }

  /* ── Grid header ── */
  .fos-grid-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .fos-grid-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--ink);
  }
  .fos-grid-count {
    font-size: 0.8rem;
    color: #9E876A;
    font-weight: 500;
  }

  /* ── Food Grid ── */
  .fos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 1.5rem;
  }

  /* ── Food Card ── */
  .fos-card {
    background: var(--warm-white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: transform .25s, box-shadow .25s;
    cursor: pointer;
    position: relative;
  }
  .fos-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-deep);
  }
  .fos-card.sold-out { opacity: 0.72; cursor: default; }
  .fos-card.sold-out:hover { transform: none; box-shadow: none; }

  .fos-card-img-wrap {
    position: relative;
    height: 200px;
    overflow: hidden;
  }
  .fos-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .5s ease;
  }
  .fos-card:not(.sold-out):hover .fos-card-img { transform: scale(1.07); }

  .fos-card-img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(26,18,8,0.5) 0%, transparent 50%);
  }

  .fos-card-badge {
    position: absolute;
    top: 12px; right: 12px;
    background: rgba(253,248,242,0.92);
    backdrop-filter: blur(8px);
    border-radius: 50px;
    padding: 4px 10px;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .fos-card-sold-badge {
    position: absolute;
    top: 12px; left: 12px;
    background: rgba(200,68,10,0.92);
    backdrop-filter: blur(8px);
    border-radius: 50px;
    padding: 5px 12px;
    font-size: 0.7rem;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 4px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .fos-card-time {
    position: absolute;
    bottom: 12px; left: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(26,18,8,0.65);
    backdrop-filter: blur(6px);
    border-radius: 50px;
    padding: 4px 10px;
    font-size: 0.72rem;
    font-weight: 500;
    color: rgba(255,255,255,0.9);
  }

  .fos-card-body { padding: 1.1rem 1.2rem 1.2rem; }

  .fos-card-name {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 0.35rem;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .fos-card-desc {
    font-size: 0.8rem;
    color: #9E876A;
    line-height: 1.55;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .fos-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .fos-card-price-wrap { display: flex; flex-direction: column; }
  .fos-card-price {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--ember);
    line-height: 1;
  }
  .fos-card-price-from {
    font-size: 0.68rem;
    color: #BEA98A;
    font-weight: 500;
    margin-top: 2px;
  }

  .fos-add-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--ink);
    color: var(--cream);
    border: none;
    border-radius: 50px;
    padding: 9px 16px;
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background .18s, transform .15s;
    white-space: nowrap;
  }
  .fos-add-btn:hover:not(:disabled) { background: var(--ember); transform: scale(1.04); }
  .fos-add-btn:disabled {
    background: #D4CAC0;
    color: #9E8E80;
    cursor: not-allowed;
  }

  /* ── Star ── */
  .fos-card-star {
    display: flex;
    align-items: center;
    gap: 3px;
    position: absolute;
    bottom: 12px; right: 12px;
    background: rgba(253,248,242,0.88);
    border-radius: 50px;
    padding: 3px 8px;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--ink-soft);
    backdrop-filter: blur(6px);
  }

  /* ── Modal ── */
  .fos-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(26,18,8,0.55);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadein .2s ease;
  }
  @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }

  .fos-modal {
    background: var(--warm-white);
    border-radius: var(--radius);
    max-width: 460px;
    width: 100%;
    overflow: hidden;
    box-shadow: var(--shadow-deep);
    animation: slideup .25s ease;
  }
  @keyframes slideup {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .fos-modal-img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  .fos-modal-body { padding: 1.5rem; }
  .fos-modal-title {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 1.25rem;
  }
  .fos-modal-close {
    position: absolute;
    top: 12px; right: 12px;
    background: rgba(253,248,242,0.9);
    border: none;
    border-radius: 50%;
    width: 34px; height: 34px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s;
    color: var(--ink);
  }
  .fos-modal-close:hover { background: #fff; }

  .fos-field-label {
    display: block;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #9E876A;
    margin-bottom: 0.5rem;
  }
  .fos-select, .fos-textarea, .fos-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--cream);
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--ink);
    outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .fos-select:focus, .fos-textarea:focus, .fos-input:focus {
    border-color: var(--ember);
    box-shadow: 0 0 0 3px rgba(200,68,10,0.08);
  }
  .fos-textarea { resize: none; }

  .fos-qty-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .fos-qty-btn {
    width: 36px; height: 36px;
    border: 1.5px solid var(--border);
    border-radius: 50%;
    background: var(--cream);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .18s;
    color: var(--ink);
  }
  .fos-qty-btn:hover { border-color: var(--ember); color: var(--ember); }
  .fos-qty-val {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--ink);
    min-width: 32px;
    text-align: center;
  }
  .fos-field-group { margin-bottom: 1.25rem; }

  .fos-modal-footer {
    padding: 0 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .fos-modal-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .fos-modal-total-label { font-size: 0.85rem; color: #9E876A; font-weight: 500; }
  .fos-modal-total-price {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--ember);
  }
  .fos-primary-btn {
    width: 100%;
    padding: 14px;
    background: var(--ember);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: background .2s, transform .15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .fos-primary-btn:hover { background: var(--ember-light); transform: translateY(-1px); }
  .fos-primary-btn:active { transform: translateY(0); }

  /* ── Cart Sidebar ── */
  .fos-cart-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(26,18,8,0.5);
    animation: fadein .2s;
  }
  .fos-cart-panel {
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 100%;
    max-width: 420px;
    background: var(--warm-white);
    z-index: 201;
    display: flex;
    flex-direction: column;
    box-shadow: -8px 0 60px rgba(26,18,8,0.2);
    animation: slidein .25s ease;
  }
  @keyframes slidein {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  .fos-cart-header {
    padding: 1.5rem 1.5rem 1.25rem;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }
  .fos-cart-title {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--ink);
    display: flex; align-items: center; gap: 10px;
  }
  .fos-cart-title-count {
    background: var(--ember);
    color: #fff;
    border-radius: 50px;
    padding: 1px 10px;
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 700;
  }
  .fos-close-btn {
    width: 36px; height: 36px;
    border: 1.5px solid var(--border);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .18s;
    color: var(--ink);
  }
  .fos-close-btn:hover { background: var(--cream); border-color: var(--ink); }

  .fos-cart-items {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .fos-cart-item {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem;
    background: var(--cream);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
  }
  .fos-cart-item-img {
    width: 56px; height: 56px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
  }
  .fos-cart-item-info { flex: 1; min-width: 0; }
  .fos-cart-item-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--ink);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .fos-cart-item-meta {
    font-size: 0.75rem;
    color: #9E876A;
  }
  .fos-cart-item-price {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--ember);
  }
  .fos-cart-qty {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .fos-cart-qty-btn {
    width: 26px; height: 26px;
    border: 1.5px solid var(--border);
    border-radius: 50%;
    background: var(--warm-white);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .15s;
    color: var(--ink-soft);
    flex-shrink: 0;
  }
  .fos-cart-qty-btn:hover { border-color: var(--ember); color: var(--ember); }
  .fos-cart-qty-val {
    font-weight: 700;
    font-size: 0.875rem;
    min-width: 18px;
    text-align: center;
    color: var(--ink);
  }

  .fos-cart-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    gap: 0.75rem;
  }
  .fos-cart-empty-icon {
    width: 72px; height: 72px;
    background: var(--cream);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 0.5rem;
    border: 2px dashed var(--border);
  }
  .fos-cart-empty-title {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--ink);
  }
  .fos-cart-empty-sub { font-size: 0.85rem; color: #9E876A; }

  .fos-cart-footer { padding: 1.25rem 1.5rem 1.5rem; border-top: 1px solid var(--border); }
  .fos-cart-line {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    color: #9E876A;
  }
  .fos-cart-line span:last-child { color: var(--ink); font-weight: 500; }
  .fos-cart-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0.75rem 0 1.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
  }
  .fos-cart-total-label {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    color: var(--ink);
  }
  .fos-cart-total-price {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 900;
    color: var(--ember);
  }

  /* ── Checkout ── */
  .fos-checkout-modal {
    background: var(--warm-white);
    border-radius: var(--radius);
    max-width: 560px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-deep);
    animation: slideup .25s ease;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .fos-checkout-header {
    padding: 1.75rem 1.75rem 1.5rem;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
    position: sticky; top: 0; background: var(--warm-white); z-index: 1;
    border-radius: var(--radius) var(--radius) 0 0;
  }
  .fos-checkout-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--ink);
  }
  .fos-checkout-sub { font-size: 0.82rem; color: #9E876A; margin-top: 3px; }

  .fos-checkout-body { padding: 1.75rem; display: flex; flex-direction: column; gap: 1.5rem; }

  .fos-section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1rem;
  }
  .fos-section-title {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    color: var(--ink);
  }
  .fos-section-icon { color: var(--ember); }

  .fos-input-group { display: flex; flex-direction: column; gap: 0.75rem; }
  .fos-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .fos-input-icon-wrap { position: relative; }
  .fos-input-icon-wrap svg {
    position: absolute;
    left: 13px; top: 50%;
    transform: translateY(-50%);
    color: #BEA98A;
    width: 16px; height: 16px;
    pointer-events: none;
  }
  .fos-input-icon-wrap .fos-input { padding-left: 38px; }

  .fos-error-text { font-size: 0.75rem; color: var(--ember); margin-top: 3px; }

  .fos-order-summary {
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 1.25rem;
  }
  .fos-summary-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--ink-soft);
    margin-bottom: 0.4rem;
  }
  .fos-summary-divider { border: none; border-top: 1px solid var(--border); margin: 0.75rem 0; }
  .fos-summary-total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .fos-summary-total-label {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1rem;
    color: var(--ink);
  }
  .fos-summary-total-price {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 1.5rem;
    color: var(--ember);
  }

  .fos-pay-btn {
    width: 100%;
    padding: 16px;
    background: var(--ember);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background .2s, transform .15s;
    letter-spacing: 0.01em;
  }
  .fos-pay-btn:hover { background: var(--ember-light); transform: translateY(-1px); }

  /* ── Toast ── */
  .fos-toast {
    position: fixed;
    top: 88px; left: 50%; transform: translateX(-50%);
    z-index: 300;
    min-width: 280px;
    max-width: 420px;
    border-radius: var(--radius-sm);
    padding: 1rem 1.25rem;
    box-shadow: var(--shadow-deep);
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    animation: slidedown .25s ease;
  }
  @keyframes slidedown {
    from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  .fos-toast.success { background: #F0FAF0; border: 1px solid #B7DEB7; }
  .fos-toast.error { background: #FEF1EE; border: 1px solid #F5C0B0; }
  .fos-toast-icon { flex-shrink: 0; margin-top: 1px; }
  .fos-toast-title { font-weight: 600; font-size: 0.9rem; color: var(--ink); }
  .fos-toast-sub { font-size: 0.8rem; margin-top: 2px; color: var(--ink-soft); opacity: 0.75; }
  .fos-toast-close {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: #9E876A;
    padding: 2px;
    border-radius: 4px;
    transition: color .15s;
    flex-shrink: 0;
  }
  .fos-toast-close:hover { color: var(--ink); }

  /* ── Loader ── */
  .fos-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    gap: 1rem;
  }
  .fos-spinner {
    width: 44px; height: 44px;
    border: 3px solid var(--border);
    border-top-color: var(--ember);
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fos-loader-text {
    font-family: var(--font-display);
    font-size: 1rem;
    color: #9E876A;
    font-style: italic;
  }

  /* ── Empty state ── */
  .fos-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    text-align: center;
    gap: 0.75rem;
  }
  .fos-empty-emoji { font-size: 4rem; margin-bottom: 0.5rem; }
  .fos-empty-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--ink);
  }
  .fos-empty-sub { font-size: 0.9rem; color: #9E876A; }
  .fos-empty-btn {
    margin-top: 0.75rem;
    padding: 10px 24px;
    background: var(--ember);
    color: #fff;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.875rem;
    transition: background .2s;
  }
  .fos-empty-btn:hover { background: var(--ember-light); }

  /* ── Footer ── */
  .fos-footer {
    background: var(--ink);
    color: rgba(255,255,255,0.6);
    padding: 4rem 2rem 2rem;
    margin-top: 5rem;
  }
  .fos-footer-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 3rem;
  }
  @media(max-width:768px){
    .fos-footer-inner { grid-template-columns: 1fr; gap: 2rem; }
  }
  .fos-footer-logo {
    height: 36px; width: auto;
    filter: brightness(0) invert(1);
    opacity: 0.8;
    margin-bottom: 1rem;
  }
  .fos-footer-desc {
    font-size: 0.85rem;
    line-height: 1.7;
    max-width: 340px;
    margin-bottom: 1.25rem;
  }
  .fos-footer-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.82rem;
  }
  .fos-footer-info-row { display: flex; align-items: center; gap: 8px; }
  .fos-footer-heading {
    font-family: var(--font-display);
    font-size: 0.9rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1.25rem;
    letter-spacing: 0.01em;
  }
  .fos-footer-links { display: flex; flex-direction: column; gap: 0.6rem; }
  .fos-footer-links a {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    transition: color .2s;
  }
  .fos-footer-links a:hover { color: var(--gold-light); }
  .fos-footer-bottom {
    max-width: 1280px;
    margin: 3rem auto 0;
    padding-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    text-align: center;
    font-size: 0.78rem;
    color: rgba(255,255,255,0.3);
  }

  /* ── Divider stripe ── */
  .fos-stripe {
    height: 3px;
    background: linear-gradient(90deg, var(--ember), var(--gold), var(--sage), var(--ember));
    background-size: 200% 100%;
    animation: movestripe 4s linear infinite;
  }
  @keyframes movestripe { to { background-position: 200% 0; } }

  /* ── Scroll area ── */
  .fos-food-scroll {
    overflow-y: auto;
    max-height: calc(100vh - 10rem);
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  @media(max-width:1024px){ .fos-food-scroll { max-height: unset; overflow-y: unset; } }
`;

// ─── Component ────────────────────────────────────────────────────────────────
const FoodOrderingSystem = () => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [allFoods, setAllFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(3.99);
  const [scrolled, setScrolled] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [selectedPanSize, setSelectedPanSize] = useState('');
  const [note, setNote] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const zipCode = watch('zipCode');

  // Inject styles once
  useEffect(() => {
    if (!document.getElementById('fos-styles')) {
      const style = document.createElement('style');
      style.id = 'fos-styles';
      style.textContent = GLOBAL_STYLES;
      document.head.appendChild(style);
    }
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch foods
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const foods = await getFoods();
        const transformed = foods.map(f => ({
          id: f._id,
          name: f.name,
          description: f.description,
          price: f.price,
          category: f.category.toLowerCase(),
          image: f.imageUrl,
          time: `${f.cookingTime} min`,
          hasSizes: f.hasSizes || false,
          panSizes: f.hasSizes ? f.sizes.map(s => ({ size: s.name, price: s.price })) : [],
          isSoldOut: f.isSoldOut === true,
        }));
        setAllFoods(transformed);
        setFilteredFoods(transformed);
        setCategories(['all', ...new Set(transformed.map(f => f.category))]);
      } catch {
        setError('Failed to load menu. Please refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Delivery fee
  useEffect(() => {
    if (zipCode && VALID_ZIP_CODES.includes(zipCode)) {
      calculateDistance(`Newark, NJ ${zipCode}`)
        .then(({ deliveryFee }) => { setDeliveryFee(parseFloat(deliveryFee.toFixed(2))); setError(null); })
        .catch(() => setError('Delivery fee error'));
    }
  }, [zipCode]);

  // Filter
  useEffect(() => {
    let list = allFoods;
    if (activeCategory !== 'all') list = list.filter(f => f.category === activeCategory);
    if (searchTerm) list = list.filter(f =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFoods(list);
  }, [activeCategory, searchTerm, allFoods]);

  // Modal
  const openModal = (food) => {
    if (food.isSoldOut) return;
    setSelectedFood(food);
    setModalQuantity(1);
    setSelectedPanSize(food.panSizes.length > 0 ? food.panSizes[0].size : '');
    setNote('');
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setSelectedFood(null); };

  const getModalPrice = () => {
    if (!selectedFood) return 0;
    if (selectedPanSize) {
      const p = selectedFood.panSizes.find(p => p.size === selectedPanSize);
      return p ? p.price : selectedFood.price;
    }
    return selectedFood.price;
  };

  const addToCartFromModal = () => {
    if (!selectedFood || selectedFood.isSoldOut) return;
    const priceAtOrder = getModalPrice();
    const cartItem = { id: selectedFood.id, name: selectedFood.name, priceAtOrder, quantity: modalQuantity, panSize: selectedPanSize || null, note: note.trim() || null, image: selectedFood.image };
    const existing = cart.find(i => i.id === cartItem.id && i.panSize === cartItem.panSize);
    if (existing) {
      setCart(cart.map(i => i.id === existing.id && i.panSize === existing.panSize ? { ...i, quantity: i.quantity + modalQuantity } : i));
    } else {
      setCart([...cart, cartItem]);
    }
    closeModal();
  };

  // Cart
  const addToCart = (food) => {
    if (food.isSoldOut) { setError("Sorry, this dish is currently sold out."); setTimeout(() => setError(null), 3500); return; }
    if (food.hasSizes && food.panSizes.length > 0) { openModal(food); return; }
    const cartItem = { id: food.id, name: food.name, priceAtOrder: food.price, quantity: 1, panSize: null, note: null, image: food.image };
    const existing = cart.find(i => i.id === cartItem.id && !i.panSize);
    if (existing) {
      setCart(cart.map(i => i.id === cartItem.id && !i.panSize ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, cartItem]);
    }
  };

  const updateQuantity = (id, panSize, change) => {
    setCart(cart.map(item => {
      if (item.id === id && item.panSize === panSize) {
        const newQty = item.quantity + change;
        return newQty <= 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const getTotalItems = () => cart.reduce((s, i) => s + i.quantity, 0);
  const getTotalPrice = () => cart.reduce((s, i) => s + i.priceAtOrder * i.quantity, 0).toFixed(2);

  const onCheckoutSubmit = async (data) => {
    try {
      const orderData = {
        items: cart.map(i => ({ food: i.id, quantity: i.quantity })),
        mobileNumber: data.mobileNumber,
        deliveryLocation: `${data.streetAddress}, ${data.city}, ${data.zipCode}`,
      };
      const { id } = await createCheckoutSession(orderData);
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (err) {
      setError(err.message || 'Checkout failed');
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="fos-root">

        {/* Toast */}
        {(orderSuccess || error) && (
          <div className={`fos-toast ${orderSuccess ? 'success' : 'error'}`}>
            <span className="fos-toast-icon">
              {orderSuccess
                ? <CheckCircle size={18} color="#3A9A3A" />
                : <XCircle size={18} color="#C8440A" />}
            </span>
            <div>
              <div className="fos-toast-title">{orderSuccess ? 'Order placed!' : 'Something went wrong'}</div>
              <div className="fos-toast-sub">{orderSuccess ? "You'll receive a confirmation soon." : error}</div>
            </div>
            <button className="fos-toast-close" onClick={() => { setOrderSuccess(null); setError(null); }}><X size={14} /></button>
          </div>
        )}

        {/* Header */}
        <header className={`fos-header ${scrolled ? 'scrolled' : ''}`}>
          <div className="fos-header-inner">
            <Link href="https://9jabukarestaurant.com">
              <img src="/9ja.png" alt="9jabuka" className="fos-logo" />
            </Link>

            <nav className="fos-nav">
              <a href="https://9jabukarestaurant.com">Home</a>
              <a href="#menu">Menu</a>
              <a href="/pages/catering">Catering</a>
              <a href="#contact">Contact</a>
            </nav>

            <div className="fos-search-wrap">
              <Search />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="fos-search-input"
              />
            </div>

            <button className="fos-cart-btn" onClick={() => setShowCart(true)}>
              <ShoppingCart size={16} />
              <span>${getTotalPrice()}</span>
              {getTotalItems() > 0 && <span className="fos-cart-badge">{getTotalItems()}</span>}
            </button>

            <button className="fos-menu-btn" onClick={() => setMobileMenuOpen(v => !v)}>
              <Menu size={18} />
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="fos-mobile-menu">
              <div className="fos-search-wrap" style={{ maxWidth: '100%' }}>
                <Search />
                <input type="text" placeholder="Search dishes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="fos-search-input" />
              </div>
              <a href="#menu" onClick={() => setMobileMenuOpen(false)}>Menu</a>
              <a href="/pages/catering" onClick={() => setMobileMenuOpen(false)}>Reservation & Catering</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            </div>
          )}
        </header>

        {/* Hero */}
        <section className="fos-hero">
          <div className="fos-hero-bg" />
          <div className="fos-hero-gradient" />
          <div className="fos-hero-content">
            <div className="fos-hero-pill"><Flame size={11} /> Authentic Nigerian Cuisine</div>
            <h1 className="fos-hero-title">
              From Our Kitchen,<br /><em>To Your Table</em>
            </h1>
            <p className="fos-hero-sub">
              Fresh ingredients, traditional recipes passed down through generations — delivered to your door.
            </p>
            <div className="fos-hero-stats">
              <div className="fos-hero-stat">
                <div className="fos-hero-stat-val">4.9★</div>
                <div className="fos-hero-stat-label">Avg Rating</div>
              </div>
              <div className="fos-hero-stat">
                <div className="fos-hero-stat-val">30–45</div>
                <div className="fos-hero-stat-label">Min Delivery</div>
              </div>
              <div className="fos-hero-stat">
                <div className="fos-hero-stat-val">{allFoods.length}+</div>
                <div className="fos-hero-stat-label">Menu Items</div>
              </div>
            </div>
          </div>
        </section>

        <div className="fos-stripe" />

        {/* Mobile categories */}
        <div className="fos-mobile-cats" id="menu">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`fos-mobile-cat-pill ${activeCategory === cat ? 'active' : ''}`}
            >
              <span>{CAT_EMOJI[cat] || '🍽️'}</span>
              {formatCategoryName(cat)}
            </button>
          ))}
        </div>

        {/* Main layout */}
<div className="fos-layout">

          {/* Sidebar */}
          <aside className="fos-sidebar">
            <div className="fos-sidebar-title">Categories</div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`fos-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              >
                <span className="fos-cat-emoji">{CAT_EMOJI[cat] || '🍽️'}</span>
                <span className="fos-cat-name">{formatCategoryName(cat)}</span>
                <span className="fos-cat-count">
                  {cat === 'all' ? allFoods.length : allFoods.filter(f => f.category === cat).length}
                </span>
              </button>
            ))}
          </aside>

          {/* Food grid */}
          <div>
            <div className="fos-grid-header">
              <h2 className="fos-grid-title">
                {formatCategoryName(activeCategory)}
                {searchTerm && <span style={{ fontStyle: 'italic', fontWeight: 400, fontSize: '1.1rem', color: '#9E876A' }}> — "{searchTerm}"</span>}
              </h2>
              {!loading && <span className="fos-grid-count">{filteredFoods.length} dishes</span>}
            </div>

            <div className="fos-food-scroll">
              {loading ? (
                <div className="fos-loader">
                  <div className="fos-spinner" />
                  <p className="fos-loader-text">Preparing the menu…</p>
                </div>
              ) : filteredFoods.length > 0 ? (
                <div className="fos-grid">
                  {filteredFoods.map(food => (
                    <div key={food.id} className={`fos-card ${food.isSoldOut ? 'sold-out' : ''}`} onClick={() => !food.isSoldOut && openModal(food)}>
                      <div className="fos-card-img-wrap">
                        <img src={food.image} alt={food.name} className="fos-card-img" />
                        <div className="fos-card-img-overlay" />
                        <div className="fos-card-badge">{formatCategoryName(food.category)}</div>
                        {food.isSoldOut && (
                          <div className="fos-card-sold-badge"><XCircle size={11} />Sold Out</div>
                        )}
                        <div className="fos-card-time"><Clock size={11} />{food.time}</div>
                        <div className="fos-card-star"><Star size={10} style={{ fill: '#D4A017', color: '#D4A017' }} />4.8</div>
                      </div>
                      <div className="fos-card-body">
                        <div className="fos-card-name">{food.name}</div>
                        <div className="fos-card-desc">{food.description}</div>
                        <div className="fos-card-footer">
                          <div className="fos-card-price-wrap">
                            <span className="fos-card-price">
                              {food.hasSizes
                                ? `From $${Math.min(...food.panSizes.map(s => s.price)).toFixed(2)}`
                                : `$${food.price.toFixed(2)}`}
                            </span>
                            {food.hasSizes && <span className="fos-card-price-from">Multiple sizes</span>}
                          </div>
                          <button
                            className="fos-add-btn"
                            disabled={food.isSoldOut}
                            onClick={e => { e.stopPropagation(); addToCart(food); }}
                          >
                            {food.isSoldOut ? <><XCircle size={13} />Sold Out</> : <><Plus size={13} />Add</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="fos-empty">
                  <div className="fos-empty-emoji">🍽️</div>
                  <h3 className="fos-empty-title">No dishes found</h3>
                  <p className="fos-empty-sub">
                    {searchTerm ? `No results for "${searchTerm}"` : 'Nothing in this category yet.'}
                  </p>
                  {(searchTerm || activeCategory !== 'all') && (
                    <button className="fos-empty-btn" onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}>
                      Show all dishes
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pan size / add modal */}
        {modalOpen && selectedFood && (
          <div className="fos-overlay" onClick={closeModal}>
            <div className="fos-modal" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <img src={selectedFood.image} alt={selectedFood.name} className="fos-modal-img" />
              <button className="fos-modal-close" onClick={closeModal}><X size={16} /></button>
              <div className="fos-modal-body">
                <div className="fos-modal-title">{selectedFood.name}</div>
                {selectedFood.panSizes && selectedFood.panSizes.length > 0 && (
                  <div className="fos-field-group">
                    <label className="fos-field-label">Choose Size</label>
                    <select value={selectedPanSize} onChange={e => setSelectedPanSize(e.target.value)} className="fos-select">
                      {selectedFood.panSizes.map(ps => (
                        <option key={ps.size} value={ps.size}>{ps.size} — ${ps.price.toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="fos-field-group">
                  <label className="fos-field-label">Quantity</label>
                  <div className="fos-qty-row">
                    <button className="fos-qty-btn" onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}><Minus size={14} /></button>
                    <span className="fos-qty-val">{modalQuantity}</span>
                    <button className="fos-qty-btn" onClick={() => setModalQuantity(modalQuantity + 1)}><Plus size={14} /></button>
                  </div>
                </div>
                <div className="fos-field-group">
                  <label className="fos-field-label">Special Instructions</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Extra spicy, no onions…" rows={2} className="fos-textarea" />
                </div>
              </div>
              <div className="fos-modal-footer">
                <div className="fos-modal-total">
                  <span className="fos-modal-total-label">Subtotal</span>
                  <span className="fos-modal-total-price">${(getModalPrice() * modalQuantity).toFixed(2)}</span>
                </div>
                <button className="fos-primary-btn" onClick={addToCartFromModal}>
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart panel */}
        {showCart && (
          <>
            <div className="fos-cart-overlay" onClick={() => setShowCart(false)} />
            <div className="fos-cart-panel">
              <div className="fos-cart-header">
                <div className="fos-cart-title">
                  Your Order
                  {getTotalItems() > 0 && <span className="fos-cart-title-count">{getTotalItems()}</span>}
                </div>
                <button className="fos-close-btn" onClick={() => setShowCart(false)}><X size={16} /></button>
              </div>

              {cart.length === 0 ? (
                <div className="fos-cart-empty">
                  <div className="fos-cart-empty-icon"><ShoppingCart size={28} color="#BEA98A" /></div>
                  <div className="fos-cart-empty-title">Your cart is empty</div>
                  <div className="fos-cart-empty-sub">Browse our menu and add some dishes!</div>
                </div>
              ) : (
                <>
                  <div className="fos-cart-items">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${item.panSize}-${idx}`} className="fos-cart-item">
                        <img src={item.image} alt={item.name} className="fos-cart-item-img" />
                        <div className="fos-cart-item-info">
                          <div className="fos-cart-item-name">{item.name}</div>
                          <div className="fos-cart-item-meta">
                            {item.panSize && <>{item.panSize} · </>}
                            ${item.priceAtOrder.toFixed(2)} each
                          </div>
                          {item.note && <div className="fos-cart-item-meta" style={{ fontStyle: 'italic' }}>"{item.note}"</div>}
                          <div className="fos-cart-item-price">${(item.priceAtOrder * item.quantity).toFixed(2)}</div>
                        </div>
                        <div className="fos-cart-qty">
                          <button className="fos-cart-qty-btn" onClick={() => updateQuantity(item.id, item.panSize, -1)}><Minus size={10} /></button>
                          <span className="fos-cart-qty-val">{item.quantity}</span>
                          <button className="fos-cart-qty-btn" onClick={() => updateQuantity(item.id, item.panSize, 1)}><Plus size={10} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="fos-cart-footer">
                    <div className="fos-cart-line"><span>Subtotal</span><span>${getTotalPrice()}</span></div>
                    <div className="fos-cart-line"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
                    <div className="fos-cart-total">
                      <span className="fos-cart-total-label">Total</span>
                      <span className="fos-cart-total-price">${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)}</span>
                    </div>
                    <button className="fos-primary-btn" onClick={() => { setShowCart(false); setShowCheckout(true); }}>
                      Checkout <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Checkout modal */}
        {showCheckout && (
          <div className="fos-overlay" onClick={() => setShowCheckout(false)}>
            <div className="fos-checkout-modal" onClick={e => e.stopPropagation()}>
              <div className="fos-checkout-header">
                <div>
                  <div className="fos-checkout-title">Complete Your Order</div>
                  <div className="fos-checkout-sub">Fill in your delivery details below</div>
                </div>
                <button className="fos-close-btn" onClick={() => setShowCheckout(false)}><X size={16} /></button>
              </div>

              <form onSubmit={handleSubmit(onCheckoutSubmit)}>
                <div className="fos-checkout-body">
                  <div>
                    <div className="fos-section-header">
                      <MapPin size={18} className="fos-section-icon" />
                      <span className="fos-section-title">Delivery Address</span>
                    </div>
                    <div className="fos-input-group">
                      <input type="text" placeholder="Street Address" {...register('streetAddress', { required: 'Required' })} className="fos-input" />
                      {errors.streetAddress && <p className="fos-error-text">{errors.streetAddress.message}</p>}
                      <div className="fos-input-row">
                        <input type="text" placeholder="City" {...register('city', { required: 'Required' })} className="fos-input" />
                        <input type="text" placeholder="ZIP Code" {...register('zipCode', { required: 'Required', validate: v => VALID_ZIP_CODES.includes(v) || 'Not in delivery zone' })} className="fos-input" />
                      </div>
                      {(errors.city || errors.zipCode) && <p className="fos-error-text">{errors.city?.message || errors.zipCode?.message}</p>}
                      <div className="fos-input-icon-wrap">
                        <Phone size={16} />
                        <input type="tel" placeholder="Phone Number" {...register('mobileNumber', { required: 'Required' })} className="fos-input" />
                      </div>
                      {errors.mobileNumber && <p className="fos-error-text">{errors.mobileNumber.message}</p>}
                    </div>
                  </div>

                  <div className="fos-order-summary">
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.875rem', color: 'var(--ink)' }}>Order Summary</div>
                    {cart.map((i, idx) => (
                      <div key={`${i.id}-${i.panSize}-${idx}`} className="fos-summary-item">
                        <span>{i.name} × {i.quantity}{i.panSize ? ` (${i.panSize})` : ''}</span>
                        <span style={{ fontWeight: 600 }}>${(i.priceAtOrder * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <hr className="fos-summary-divider" />
                    <div className="fos-summary-item"><span>Subtotal</span><span>${getTotalPrice()}</span></div>
                    <div className="fos-summary-item"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
                    <hr className="fos-summary-divider" />
                    <div className="fos-summary-total">
                      <span className="fos-summary-total-label">Total</span>
                      <span className="fos-summary-total-price">${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 1.75rem 1.75rem' }}>
                  <button type="submit" className="fos-pay-btn">
                    Pay ${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)} <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="fos-footer" id="contact">
          <div className="fos-footer-inner">
            <div>
              <img src="/9ja.png" alt="9jabuka" className="fos-footer-logo" />
              <p className="fos-footer-desc">
                Bringing you the authentic taste of Nigeria with fresh ingredients and traditional recipes passed down through generations.
              </p>
              <div className="fos-footer-info">
                <div className="fos-footer-info-row"><Clock size={13} /><span>Daily 9AM – 7:30PM</span></div>
                <div className="fos-footer-info-row"><Phone size={13} /><span>973-753-4447 · 862-291-6464</span></div>
              </div>
            </div>
            <div>
              <div className="fos-footer-heading">Quick Links</div>
              <div className="fos-footer-links">
                <a href="#menu">Menu</a>
                <a href="#about">About Us</a>
                <a href="#contact">Contact</a>
                <a href="#faq">FAQ</a>
              </div>
            </div>
            <div>
              <div className="fos-footer-heading">Customer Care</div>
              <div className="fos-footer-links">
                <a href="#support">Support</a>
                <a href="#delivery">Delivery Info</a>
                <a href="#returns">Returns</a>
                <a href="#privacy">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="fos-footer-bottom">
            © 2025 9jabuka · All rights reserved · Authentic Nigerian flavors to your table
          </div>
        </footer>

      </div>
    </Elements>
  );
};

export default FoodOrderingSystem;