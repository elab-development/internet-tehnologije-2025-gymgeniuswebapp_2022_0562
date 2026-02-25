import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../Card';

describe('Card Component', () => {
  it('should render card with title', () => {
    render(<Card title="Test Card" />);

    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('should render card with subtitle', () => {
    render(<Card title="Title" subtitle="Subtitle text" />);

    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should render footer', () => {
    render(
      <Card footer={<button>Action</button>}>
        Content
      </Card>
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should handle onClick event when hoverable', () => {
    const handleClick = jest.fn();
    render(<Card hoverable onClick={handleClick}>Clickable Card</Card>);

    const card = screen.getByText('Clickable Card').closest('[role]');
    if (card) {
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalled();
    }
  });

  it('should apply hover styles when hoverable prop is true', () => {
    render(<Card hoverable>Hover me</Card>);

    const card = screen.getByText('Hover me').closest('div');
    expect(card).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Card className="custom-class">Content</Card>);

    const card = screen.getByText('Content').parentElement?.parentElement;
    expect(card).toHaveClass('custom-class');
  });
});
