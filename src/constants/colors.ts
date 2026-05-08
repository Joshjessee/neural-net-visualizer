import type { LayerType } from '../types/network';

export const LAYER_COLORS: Record<LayerType, { bg: string; border: string; text: string }> = {
  input:              { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  dense:              { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  conv2d:             { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
  maxPool2d:          { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3' },
  flatten:            { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
  dropout:            { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
  batchNorm:          { bg: '#e0f2fe', border: '#0ea5e9', text: '#0c4a6e' },
  embedding:          { bg: '#fef9c3', border: '#eab308', text: '#713f12' },
  lstm:               { bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
  gru:                { bg: '#fed7aa', border: '#fb923c', text: '#9a3412' },
  multiHeadAttention: { bg: '#fecaca', border: '#ef4444', text: '#991b1b' },
  feedForward:        { bg: '#fee2e2', border: '#f87171', text: '#991b1b' },
  output:             { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
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
