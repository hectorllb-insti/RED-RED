// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia robustly
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  };
}

// Mock framer-motion para evitar errores de CSS en JSDOM
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  motion: new Proxy(
    {},
    {
      get: (target, key) => {
        return (props) => {
          const {
            children,
            initial,
            animate,
            exit,
            transition,
            variants,
            whileHover,
            whileTap,
            whileFocus,
            whileDrag,
            whileInView,
            onAnimationComplete,
            onAnimationStart,
            onUpdate,
            layout,
            ...validProps
          } = props;
          const Component = key;
          return <Component {...validProps}>{children}</Component>;
        };
      },
    }
  ),
  AnimatePresence: ({ children }) => <>{children}</>,
}));
