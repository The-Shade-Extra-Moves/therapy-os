import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Delete, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalculatorAppProps {
  windowId?: string;
}

type OperationType = '+' | '-' | '×' | '÷' | '=' | null;

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: OperationType;
  waitingForNewValue: boolean;
  isNewCalculation: boolean;
}

const initialState: CalculatorState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForNewValue: false,
  isNewCalculation: true,
};

export const CalculatorApp: React.FC<CalculatorAppProps> = () => {
  const [state, setState] = useState<CalculatorState>(initialState);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [buttonAnimation, setButtonAnimation] = useState<string | null>(null);

  // Button press animation
  const handleButtonPress = (buttonValue: string) => {
    setButtonAnimation(buttonValue);
    setTimeout(() => setButtonAnimation(null), 100);
  };

  // Input number
  const inputNumber = useCallback((num: string) => {
    const { display, waitingForNewValue, isNewCalculation } = state;
    
    if (waitingForNewValue || isNewCalculation) {
      setState(prev => ({
        ...prev,
        display: num,
        waitingForNewValue: false,
        isNewCalculation: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        display: display === '0' ? num : display + num,
      }));
    }
  }, [state]);

  // Input decimal
  const inputDecimal = useCallback(() => {
    const { display, waitingForNewValue, isNewCalculation } = state;
    
    if (waitingForNewValue || isNewCalculation) {
      setState(prev => ({
        ...prev,
        display: '0.',
        waitingForNewValue: false,
        isNewCalculation: false,
      }));
    } else if (display.indexOf('.') === -1) {
      setState(prev => ({
        ...prev,
        display: display + '.',
      }));
    }
  }, [state]);

  // Perform calculation
  const calculate = useCallback((firstValue: number, secondValue: number, operation: OperationType): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : firstValue;
      default:
        return secondValue;
    }
  }, []);

  // Perform operation
  const performOperation = useCallback((nextOperation: OperationType) => {
    const { display, previousValue, operation } = state;
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setState(prev => ({
        ...prev,
        previousValue: inputValue,
        operation: nextOperation,
        waitingForNewValue: true,
      }));
    } else if (operation && !state.waitingForNewValue) {
      const currentValue = previousValue || 0;
      const result = calculate(currentValue, inputValue, operation);
      const resultString = String(result);
      
      // Add to history
      const calculation = `${currentValue} ${operation} ${inputValue} = ${result}`;
      setHistory(prev => [calculation, ...prev.slice(0, 19)]); // Keep last 20 calculations
      
      setState(prev => ({
        ...prev,
        display: resultString,
        previousValue: result,
        operation: nextOperation,
        waitingForNewValue: true,
      }));
    } else {
      setState(prev => ({
        ...prev,
        operation: nextOperation,
        waitingForNewValue: true,
      }));
    }
  }, [state, calculate]);

  // Clear functions
  const clearAll = useCallback(() => {
    setState(initialState);
  }, []);

  const clearEntry = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: '0',
    }));
  }, []);

  // Backspace
  const backspace = useCallback(() => {
    const { display } = state;
    if (display.length > 1) {
      setState(prev => ({
        ...prev,
        display: display.slice(0, -1),
      }));
    } else {
      setState(prev => ({
        ...prev,
        display: '0',
      }));
    }
  }, [state]);

  // Percentage
  const percentage = useCallback(() => {
    const { display } = state;
    const value = parseFloat(display);
    setState(prev => ({
      ...prev,
      display: String(value / 100),
      waitingForNewValue: true,
    }));
  }, [state]);

  // Plus/minus toggle
  const toggleSign = useCallback(() => {
    const { display } = state;
    const value = parseFloat(display);
    setState(prev => ({
      ...prev,
      display: String(-value),
    }));
  }, [state]);

  // Handle button click
  const handleButtonClick = (value: string) => {
    handleButtonPress(value);
    
    if (value === 'AC') {
      clearAll();
    } else if (value === 'C') {
      clearEntry();
    } else if (value === '⌫') {
      backspace();
    } else if (value === '%') {
      percentage();
    } else if (value === '±') {
      toggleSign();
    } else if (value === '.') {
      inputDecimal();
    } else if (['+', '-', '×', '÷'].includes(value)) {
      performOperation(value as OperationType);
    } else if (value === '=') {
      performOperation('=');
    } else if (!isNaN(Number(value))) {
      inputNumber(value);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      event.preventDefault();
      const { key } = event;
      
      if (key >= '0' && key <= '9') {
        handleButtonClick(key);
      } else if (key === '.') {
        handleButtonClick('.');
      } else if (key === '+') {
        handleButtonClick('+');
      } else if (key === '-') {
        handleButtonClick('-');
      } else if (key === '*') {
        handleButtonClick('×');
      } else if (key === '/') {
        handleButtonClick('÷');
      } else if (key === 'Enter' || key === '=') {
        handleButtonClick('=');
      } else if (key === 'Backspace') {
        handleButtonClick('⌫');
      } else if (key === 'Escape') {
        handleButtonClick('AC');
      } else if (key === '%') {
        handleButtonClick('%');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Format display number
  const formatDisplay = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    // Handle very large or very small numbers
    if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(6);
    }
    
    // Format with appropriate decimal places
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 9,
      minimumFractionDigits: 0,
    }).format(num);
    
    return formatted;
  };

  const buttonConfig = [
    [
      { value: 'AC', type: 'function', color: 'gray' },
      { value: '±', type: 'function', color: 'gray' },
      { value: '%', type: 'function', color: 'gray' },
      { value: '÷', type: 'operator', color: 'orange' },
    ],
    [
      { value: '7', type: 'number', color: 'dark' },
      { value: '8', type: 'number', color: 'dark' },
      { value: '9', type: 'number', color: 'dark' },
      { value: '×', type: 'operator', color: 'orange' },
    ],
    [
      { value: '4', type: 'number', color: 'dark' },
      { value: '5', type: 'number', color: 'dark' },
      { value: '6', type: 'number', color: 'dark' },
      { value: '-', type: 'operator', color: 'orange' },
    ],
    [
      { value: '1', type: 'number', color: 'dark' },
      { value: '2', type: 'number', color: 'dark' },
      { value: '3', type: 'number', color: 'dark' },
      { value: '+', type: 'operator', color: 'orange' },
    ],
    [
      { value: '0', type: 'number', color: 'dark', wide: true },
      { value: '.', type: 'number', color: 'dark' },
      { value: '=', type: 'operator', color: 'orange' },
    ],
  ];

  const getButtonStyle = (button: any) => {
    const baseClasses = "h-16 rounded-full font-medium text-xl transition-all duration-150 active:scale-95 select-none";
    const isActive = buttonAnimation === button.value;
    const isOperatorActive = state.operation === button.value && state.waitingForNewValue;
    
    switch (button.color) {
      case 'gray':
        return `${baseClasses} bg-gray-400 hover:bg-gray-300 text-black ${
          isActive ? 'scale-95 brightness-90' : ''
        }`;
      case 'orange':
        return `${baseClasses} ${
          isOperatorActive 
            ? 'bg-white text-orange-500 border-2 border-orange-500' 
            : 'bg-orange-500 hover:bg-orange-400 text-white'
        } ${isActive ? 'scale-95 brightness-90' : ''}`;
      case 'dark':
        return `${baseClasses} bg-gray-700 hover:bg-gray-600 text-white ${
          isActive ? 'scale-95 brightness-110' : ''
        }`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="h-full bg-black text-white flex flex-col rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg">
            <Calculator className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold">Calculator</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            History
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleButtonClick('⌫')}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Delete className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 border-r border-gray-800 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-300">History</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistory([])}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-8">
                      No calculations yet
                    </p>
                  ) : (
                    history.map((calc, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-gray-400 p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800 transition-colors"
                        onClick={() => {
                          const result = calc.split(' = ')[1];
                          setState(prev => ({
                            ...prev,
                            display: result,
                            isNewCalculation: true,
                          }));
                        }}
                      >
                        {calc}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calculator */}
        <div className="flex-1 flex flex-col">
          {/* Display */}
          <div className="flex-1 p-6 flex items-end justify-end bg-black">
            <div className="text-right w-full">
              {state.previousValue !== null && state.operation && (
                <div className="text-gray-500 text-sm mb-1">
                  {formatDisplay(String(state.previousValue))} {state.operation}
                </div>
              )}
              <motion.div
                key={state.display}
                initial={{ scale: 1.05, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="text-6xl font-light text-white break-all"
                style={{ 
                  fontSize: state.display.length > 8 ? '3rem' : 
                           state.display.length > 6 ? '4rem' : '4.5rem' 
                }}
              >
                {formatDisplay(state.display)}
              </motion.div>
            </div>
          </div>

          {/* Buttons */}
          <div className="p-4 space-y-3">
            {buttonConfig.map((row, rowIndex) => (
              <div key={rowIndex} className="flex space-x-3">
                {row.map((button) => (
                  <motion.button
                    key={button.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleButtonClick(button.value)}
                    className={`
                      ${getButtonStyle(button)}
                      ${button.wide ? 'flex-grow-[2] mr-3' : 'flex-1'}
                    `}
                  >
                    {button.value}
                  </motion.button>
                ))}
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="px-4 pb-2 text-center">
            <p className="text-xs text-gray-500">
              Use keyboard for input • ESC to clear • Enter for equals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
