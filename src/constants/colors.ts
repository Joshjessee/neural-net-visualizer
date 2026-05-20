import type { LayerType } from '../types/network';

// Dark-theme layer colors: deep tinted backgrounds, vibrant borders, bright text
export const LAYER_COLORS: Record<LayerType, { bg: string; border: string; text: string }> = {
  input:              { bg: '#0c1a2e', border: '#1d6fcc', text: '#58a6ff' },
  dense:              { bg: '#1a1500', border: '#9e6a03', text: '#e3b341' },
  conv2d:             { bg: '#0d1a11', border: '#1a7337', text: '#3fb950' },
  maxPool2d:          { bg: '#160d33', border: '#6741d9', text: '#c084fc' },
  flatten:            { bg: '#180c2d', border: '#7c3aed', text: '#a78bfa' },
  dropout:            { bg: '#200c1e', border: '#be185d', text: '#f472b6' },
  batchNorm:          { bg: '#0c1929', border: '#0369a1', text: '#38bdf8' },
  embedding:          { bg: '#1a1200', border: '#b45309', text: '#fbbf24' },
  lstm:               { bg: '#1c1008', border: '#c2410c', text: '#fb923c' },
  gru:                { bg: '#1b0e09', border: '#9a3412', text: '#f97316' },
  multiHeadAttention: { bg: '#1e0c0c', border: '#991b1b', text: '#f87171' },
  feedForward:        { bg: '#1e0d0d', border: '#b91c1c', text: '#fca5a5' },
  output:             { bg: '#0a1d11', border: '#15803d', text: '#4ade80' },
};

export const LAYER_ICONS: Record<LayerType, string> = {
  input:              '📥',
  dense:              '🔗',
  conv2d:             '🔲',
  maxPool2d:          '⬇️',
  flatten:            '📏',
  dropout:            '💧',
  batchNorm:          '📊',
  embedding:          '📝',
  lstm:               '🔄',
  gru:                '🔃',
  multiHeadAttention: '👁️',
  feedForward:        '➡️',
  output:             '📤',
};

export const ACTIVATION_COLORS = {
  low: '#3b82f6',
  mid: '#fbbf24',
  high: '#ef4444',
};
