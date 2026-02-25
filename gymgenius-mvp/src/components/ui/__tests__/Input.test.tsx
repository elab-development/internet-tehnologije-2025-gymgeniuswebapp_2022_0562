import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input Component', () => {
  it('should render input with label', () => {
    render(<Input label="Email" />);

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should render input with placeholder', () => {
    render(<Input placeholder="Enter email" />);

    const input = screen.getByPlaceholderText('Enter email');
    expect(input).toBeInTheDocument();
  });

  it('should handle onChange event', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should display error message', () => {
    render(<Input error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should display helper text', () => {
    render(<Input helperText="Enter your email address" />);

    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('should apply error styles when error prop is provided', () => {
    render(<Input error="Error message" />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('should apply fullWidth class', () => {
    render(<Input fullWidth />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });
});
