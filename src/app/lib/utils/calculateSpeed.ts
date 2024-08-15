export const calculateSpeed = (numbers : number[], value:number) : number => {

    if (numbers.length === 0 || !numbers.includes(value)) {
       return 0.1
    }

    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    if (min === max) {
        return 20;
    }

    // Нормализация значения на шкале от 0.1 до 19.998
    const normalizedValue = ((value - min) / (max - min)) * 18.998 + 1;
    return parseFloat(normalizedValue.toFixed(3));
}

