// Defines the available card decks

export const DECKS = {
  fibonacci: {
    name: 'Fibonacci',
    values: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕']
  },
  modified_fibonacci: {
    name: 'Modified Fibonacci',
    values: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕']
  },
  t_shirt: {
    name: 'T-Shirt Sizes',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕']
  },
  // Add more decks as needed
};

export function getDeckValues(deckType) {
  return DECKS[deckType]?.values || DECKS.fibonacci.values; // Default to Fibonacci if type unknown
}
