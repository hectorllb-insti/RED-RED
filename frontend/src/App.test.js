import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock matchMedia para evitar errores con clases/librerías que lo usan
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

describe('App Component Structure', () => {
  test('renders without crashing', () => {
    // Renderea App, como tiene Router y QueryClient debería iniciar
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
