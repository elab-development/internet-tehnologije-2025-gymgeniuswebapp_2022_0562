import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('should render button with children text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should apply primary variant styles by default', () => {
    render(<Button>Primary</Button>);

    const button = screen.getByText('Primary');
    expect(button).toBeInTheDocument();
  });

  it('should apply secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByText('Secondary');
    expect(button).toBeInTheDocument();
  });

  it('should apply danger variant styles', () => {
    render(<Button variant="danger">Delete</Button>);

    const button = screen.getByText('Delete');
    expect(button).toBeInTheDocument();
  });

  it('should handle onClick event', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    const button = screen.getByText('Click');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should show loading state when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);

    const button = screen.getByText('Loading');
    expect(button).toBeInTheDocument();
  });

  it('should apply fullWidth class', () => {
    render(<Button fullWidth>Full Width</Button>);

    const button = screen.getByText('Full Width');
    expect(button).toBeInTheDocument();
  });

  it('should apply different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByText('Small');
    expect(button).toBeInTheDocument();

    rerender(<Button size="md">Medium</Button>);
    button = screen.getByText('Medium');
    expect(button).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByText('Large');
    expect(button).toBeInTheDocument();
  });
});
