import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, describe, it, vitest } from 'vitest';
import { Button } from '../src/components/ui/button';

describe('Button Component', () => {
  it('renders correctly with default text', () => {
    const { container } = render(<div><Button>Click Me</Button></div>);
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vitest.fn();

    render(<div><Button onClick={handleClick}>Test Button</Button></div>);
    const buttonElement = screen.getByRole('button', { name: /Test Button/i });

    await act(async () => {
      await userEvent.click(buttonElement);
    });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with a specific variant', () => {
    render(<div><Button variant="destructive">Delete</Button></div>);
    const buttonElement = screen.getByRole('button', { name: /Delete/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<div><Button disabled>Disabled Button</Button></div>);
    const buttonElement = screen.getByRole('button', { name: /Disabled Button/i });
    expect(buttonElement).toBeDisabled();
  });
});
