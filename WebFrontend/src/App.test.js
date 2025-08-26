import { render, screen } from '@testing-library/react';
import App from './App';

test('renders BugFlow brand in navbar', () => {
  render(<App />);
  const brand = screen.getByText(/BugFlow/i);
  expect(brand).toBeInTheDocument();
});
