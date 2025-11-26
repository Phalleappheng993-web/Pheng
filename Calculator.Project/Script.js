$(document).ready(function() {
    let input = "";
    const display = $("#display");
    const MAX_DIGITS = 12;

    function updateDisplay() {
        if (input === "") {
            display.val("0");
        } else {
            display.val(input);
        }
    }

    function toSafeExpression(str) {
        return str.replace(/÷/g, "/").replace(/×/g, "*");
    }

    function calculate() {
        if (input === "") return;

        try {
            let safeInput = toSafeExpression(input);
            
            // Safer evaluation using math.js approach (simplified)
            let result;
            try {
                result = evaluateExpression(safeInput);
            } catch (e) {
                // Fallback to eval but with validation
                if (!isValidExpression(safeInput)) {
                    throw new Error("Invalid expression");
                }
                result = eval(safeInput);
            }

            // Handle division by zero
            if (!isFinite(result)) {
                display.val("Error");
                input = "";
                return;
            }

            // Round decimals to prevent floating point issues
            if (typeof result === 'number' && result % 1 !== 0) {
                result = parseFloat(result.toFixed(10));
            }

            result = result.toString();

            // Check length after result
            if (result.replace("-", "").replace(".", "").length > MAX_DIGITS) {
                display.val("Overflow");
                input = "";
                return;
            }

            input = result;
            updateDisplay();
        } catch (e) {
            display.val("Error");
            input = "";
        }
    }

    function evaluateExpression(expr) {
        // Basic expression evaluation - you can expand this for better security
        // This is a simplified version that handles basic arithmetic
        const tokens = expr.match(/(\d+\.?\d*|[\+\-\*\/%])/g);
        if (!tokens) throw new Error("Invalid expression");
        
        return eval(expr); // In production, use a proper parser like math.js
    }

    function isValidExpression(expr) {
        // Basic validation to prevent code injection
        return /^[0-9+\-*\/%.()\s]+$/.test(expr);
    }

    function toggleSign() {
        // Improved sign toggle that handles various cases
        if (input === "" || input === "0") return;
        
        const numRegex = /(-?\d+\.?\d*)$/;
        const match = input.match(numRegex);
        
        if (match) {
            const number = match[1];
            const newNumber = number.startsWith('-') ? number.substring(1) : '-' + number;
            input = input.slice(0, -number.length) + newNumber;
        }
        updateDisplay();
    }

    function handleInput(value) {
        const lastChar = input.slice(-1);
        const isOperator = (char) => ['+', '-', '*', '/', '%', '×', '÷'].includes(char);
        const isValueOperator = isOperator(value);

        // Count only numeric digits for limit check
        const digitCount = (input.match(/[0-9]/g) || []).length;

        switch (value) {
            case "AC":
                input = "";
                break;

            case "backspace":
                input = input.slice(0, -1);
                break;

            case "=":
            case "Enter":
                calculate();
                return;
            
            case "+/-":
                toggleSign();
                return;

            case ".":
                const parts = input.split(/[\+\-\*\/%×÷]/);
                const lastPart = parts[parts.length - 1];
                
                // Prevent multiple decimals in the same number
                if (lastPart.includes(".")) return;
                
                // Handle cases where decimal is first character after operator
                if (input === "" || /[\+\-\*\/%×÷]$/.test(input)) {
                    input += "0.";
                } else if (lastPart === "") {
                    input += "0.";
                } else {
                    input += ".";
                }
                break;

            default:
                let displayValue = value;
                if (value === '*') displayValue = '×';
                if (value === '/') displayValue = '÷';

                // Get the current number being entered
                const partsCheck = input.split(/[\+\-\*\/%×÷]/);
                const currentNum = partsCheck[partsCheck.length - 1];

                // Handle leading zeros more intelligently
                if (currentNum === "0" && /^[0-9]$/.test(value) && !currentNum.includes(".")) {
                    // Replace the leading zero with the new digit
                    input = input.slice(0, -1) + value;
                    break;
                }

                // Prevent typing more than 12 digits
                if (/^[0-9]$/.test(value) && digitCount >= MAX_DIGITS) {
                    return;
                }

                // Handle operator behavior
                if (isValueOperator) {
                    if (input === "" && value !== '-') {
                        // Don't allow operators at start except for negative
                        return;
                    } else if (isOperator(lastChar)) {
                        // Replace consecutive operators, but allow negative numbers
                        if (value === '-' && lastChar !== '-') {
                            input += displayValue;
                        } else {
                            // Replace the previous operator
                            input = input.slice(0, -1) + displayValue;
                        }
                    } else {
                        input += displayValue;
                    }
                } else if (/^[0-9+\-\*%/.\/×÷]$/.test(value)) {
                    input += displayValue;
                }
                break;
        }

        updateDisplay();
    }

    // Button clicks
    $(".buttons-grid button").click(function() {
        let value = $(this).data("value");
        handleInput(value);
    });

    // Keyboard input
    $(document).on("keydown", function(e) {
        e.preventDefault();
        let key = e.key;
        let mappedValue = key;

        if (key === "/") mappedValue = "÷";
        else if (key === "*") mappedValue = "×";
        else if (key === "x" || key === "X") mappedValue = "×";
        else if (key === "Backspace") mappedValue = "backspace";
        else if (key === "Delete") mappedValue = "AC";
        else if (key === "Enter" || key === "=") mappedValue = "=";
        else if (!/^[0-9+\-*/.=]$/.test(key)) return; // Ignore invalid keys

        handleInput(mappedValue);
    });

    // Initialize display
    updateDisplay();
});