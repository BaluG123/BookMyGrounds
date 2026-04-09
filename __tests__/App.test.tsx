/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-redux', () => {
  const React = require('react');
  return {
    Provider: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

jest.mock('../src/store', () => ({
  store: {},
}));

jest.mock('../src/navigation/RootNavigator', () => {
  const React = require('react');
  return () => React.createElement('RootNavigator');
});

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
