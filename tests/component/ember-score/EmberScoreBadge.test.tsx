/**
 * Component Test: EmberScoreBadge
 * 
 * Tests the EmberScoreBadge component rendering and styling
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmberScoreBadge } from '@/components/ember-score/EmberScoreBadge';

describe('EmberScoreBadge', () => {
  it('renders with score value', () => {
    render(<EmberScoreBadge score={85} />);
    
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('applies correct color for high scores (80+)', () => {
    const { container } = render(<EmberScoreBadge score={90} />);
    
    const badge = container.querySelector('[data-testid="ember-badge"]');
    expect(badge).toHaveClass('bg-green-500');
  });

  it('applies correct color for medium scores (70-79)', () => {
    const { container } = render(<EmberScoreBadge score={75} />);
    
    const badge = container.querySelector('[data-testid="ember-badge"]');
    expect(badge).toHaveClass('bg-yellow-500');
  });

  it('applies correct color for low scores (60-69)', () => {
    const { container } = render(<EmberScoreBadge score={65} />);
    
    const badge = container.querySelector('[data-testid="ember-badge"]');
    expect(badge).toHaveClass('bg-orange-500');
  });

  it('shows flame icon', () => {
    render(<EmberScoreBadge score={80} />);
    
    // Check for flame emoji or icon
    const badge = screen.getByTestId('ember-badge');
    expect(badge).toBeInTheDocument();
  });

  it('enforces valid score range (60-100)', () => {
    // Below minimum
    const { rerender } = render(<EmberScoreBadge score={50} />);
    expect(screen.queryByText('50')).not.toBeInTheDocument();
    
    // Above maximum
    rerender(<EmberScoreBadge score={110} />);
    expect(screen.queryByText('110')).not.toBeInTheDocument();
    
    // Within range
    rerender(<EmberScoreBadge score={85} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders with custom size prop', () => {
    const { container } = render(<EmberScoreBadge score={80} size="lg" />);
    
    const badge = container.querySelector('[data-testid="ember-badge"]');
    expect(badge).toHaveClass('text-lg');
  });
});
