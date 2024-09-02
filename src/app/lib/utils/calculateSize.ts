export const calculateSize = (numbers : number[], value:number) : number => {
    if (numbers.length === 0 || !numbers.includes(value)) {
       return 1
    }

    // Нормализация чисел в диапазоне от 1 до 9.999
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    if (min === max) {
        return 8.698;
    }

    // Нормализация значения на шкале от 1 до 9.999
    const normalizedValue = ((value - min) / (max - min)) * 7.998  + 1;
    return parseFloat(normalizedValue.toFixed(3));
}

