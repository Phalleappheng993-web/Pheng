$(document).ready(function() {
    let input = "";
    const display = $("#display");
    const MAX_DIGITS = 12; // limit to 12 numbers (digits)

    function updateDisplay() {
        if (input === "") {
            display.val("0");
        } else {
            display.val(input);
        }
    }

    function toSafeExpression(str) {
        let safeStr = str.replace(/÷/g, "/").replace(/×/g, "*");
        return safeStr; // keep % as modulo
    }

    function calculate() {
        if (input === "") return;

        try {
            let safeInput = toSafeExpression(input);
            let result = Function('return ' + safeInput)();

            // Round decimals
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

    function toggleSign() {
        const numRegex = /(-?\d+\.?\d*)$/;
        if (input.match(numRegex)) {
            input = input.replace(numRegex, (match) =>
                match.startsWith('-') ? match.substring(1) : '-' + match
            );
        }
        updateDisplay();
    }

    function handleInput(value) {
        const lastChar = input.slice(-1);
        const isOperator = (char) => ['+', '-', '*', '/', '%', '×', '÷'].includes(char);
        const isValueOperator = isOperator(value);

        // Count only numeric digits
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
                if (lastPart.includes(".")) return;
                input += (lastPart === "" || input === "") ? "0." : ".";
                break;

            default:
                let displayValue = value;
                if (value === '*') displayValue = '×';
                if (value === '/') displayValue = '÷';

                // Prevent multiple leading zeros like 0000
                const partsCheck = input.split(/[\+\-\*\/%×÷]/);
                const currentNum = partsCheck[partsCheck.length - 1];
                if (currentNum === "0" && /^[0-9]$/.test(value)) return;

                // Prevent typing more than 12 digits (but still allow operator)
                if (/^[0-9]$/.test(value) && digitCount >= MAX_DIGITS) {
                    return;
                }

                // Handle operator behavior
                if (isValueOperator && isOperator(lastChar)) {
                    if (value !== '-') { 
                        input = input.slice(0, -1) + displayValue;
                    } else if (value === '-' && lastChar !== '-') {
                        input += displayValue;
                    }
                } else if (input === "" && isValueOperator && value !== '-') {
                    return;
                } else if (/^[0-9+\-\*%/.\/×÷]$/.test(value)) {
                    input += displayValue;
                }
                break;
        }

        updateDisplay();
    }

    // --- Button clicks ---
    $(".buttons-grid button").click(function() {
        let value = $(this).data("value");
        handleInput(value);
    });

    // --- Keyboard input ---
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

        handleInput(mappedValue);
    });

    updateDisplay();
});
