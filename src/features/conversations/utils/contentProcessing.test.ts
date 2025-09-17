// Test examples for citation removal utility
// This file demonstrates the citation removal functionality

import { removeCitations } from './contentProcessing';

// Example test cases
const testCases = [
  {
    input: "This is a great explanation about AI [doc1] and machine learning [doc2].",
    expected: "This is a great explanation about AI and machine learning."
  },
  {
    input: "Here are the key points [source1]: 1. AI is powerful [doc3] 2. ML needs data [ref2]",
    expected: "Here are the key points: 1. AI is powerful 2. ML needs data"
  },
  {
    input: "**Bold text** with citations [doc1] and *italic text* [source2]",
    expected: "**Bold text** with citations and *italic text*"
  },
  {
    input: "Multiple citations [1] [2] [3] in sequence",
    expected: "Multiple citations in sequence"
  },
  {
    input: "Citations at the end [doc123] [ref456] [source789]",
    expected: "Citations at the end"
  },
  {
    input: "No citations in this text at all",
    expected: "No citations in this text at all"
  },
  {
    input: "[doc1] Citations at the beginning and middle [doc2] and end [doc3]",
    expected: "Citations at the beginning and middle and end"
  }
];

// Function to test citation removal
export const testCitationRemoval = () => {
  console.group('🧪 Citation Removal Tests');

  testCases.forEach((testCase, index) => {
    const result = removeCitations(testCase.input);
    const passed = result === testCase.expected;

    console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Input:    "${testCase.input}"`);
    console.log(`Expected: "${testCase.expected}"`);
    console.log(`Result:   "${result}"`);
    console.log('---');
  });

  console.groupEnd();
};

// Example usage:
// testCitationRemoval();